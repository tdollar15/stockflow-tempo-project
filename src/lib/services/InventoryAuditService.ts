import { z } from 'zod';
import { supabase } from '$lib/supabaseClient';
import { InventoryService } from '../inventory-service';
import { TransactionType, TransactionStatus } from '../types/TransactionTypes';
import { UserRole } from '../types/UserTypes';
import { logService } from './LogService';

// Audit log schema for inventory changes
export const InventoryAuditLogSchema = z.object({
  id: z.string().uuid(),
  transaction_id: z.string().uuid(),
  item_id: z.string().uuid(),
  storeroom_id: z.string().uuid(),
  change_type: z.enum(['INCREASE', 'DECREASE', 'REVERSAL']),
  quantity_changed: z.number(),
  previous_quantity: z.number(),
  new_quantity: z.number(),
  user_id: z.string().uuid(),
  user_role: z.nativeEnum(UserRole),
  timestamp: z.date(),
  transaction_type: z.nativeEnum(TransactionType),
  reason: z.string().optional()
});

export class InventoryAuditService {
  // Adjust stock levels based on transaction
  async adjustStockLevel(
    transactionDetails: {
      transaction_id: string;
      transaction_type: TransactionType;
      user_id: string;
      user_role: UserRole;
      items: Array<{
        item_id: string;
        storeroom_id: string;
        quantity: number;
      }>;
    }
  ): Promise<void> {
    const { transaction_id, transaction_type, user_id, user_role, items } = transactionDetails;

    for (const item of items) {
      try {
        // Fetch current inventory state
        const currentInventory = await InventoryService.getInventoryItems({
          filters: { 
            item_name: item.item_id, 
            storeroom_id: item.storeroom_id 
          }
        });

        const currentItem = currentInventory.data[0];
        const changeType = transaction_type === TransactionType.ISSUANCE 
          ? 'DECREASE' 
          : transaction_type === TransactionType.RECEIPT 
            ? 'INCREASE' 
            : 'REVERSAL';

        const newQuantity = changeType === 'DECREASE' 
          ? currentItem.quantity - item.quantity 
          : currentItem.quantity + item.quantity;

        // Update inventory
        await InventoryService.updateItem(currentItem.id, { 
          quantity: newQuantity 
        });

        // Log audit trail
        await this.logInventoryChange({
          transaction_id,
          item_id: item.item_id,
          storeroom_id: item.storeroom_id,
          change_type: changeType,
          quantity_changed: item.quantity,
          previous_quantity: currentItem.quantity,
          new_quantity: newQuantity,
          user_id,
          user_role,
          transaction_type,
          reason: `Stock adjustment for ${transaction_type}`
        });

      } catch (error) {
        logService.error('InventoryAuditService.adjustStockLevel', {
          error: error instanceof Error ? error.message : 'Unknown error',
          item_id: item.item_id,
          transaction_id
        });
        throw error;
      }
    }
  }

  // Log inventory change details
  private async logInventoryChange(
    auditLogEntry: z.infer<typeof InventoryAuditLogSchema>
  ): Promise<void> {
    try {
      await supabase
        .from('inventory_audit_logs')
        .insert(auditLogEntry);
    } catch (error) {
      logService.error('InventoryAuditService.logInventoryChange', {
        error: error instanceof Error ? error.message : 'Unknown error',
        auditLogEntry
      });
    }
  }

  // Reverse a transaction and restore previous inventory state
  async reverseTransaction(
    transactionId: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<void> {
    try {
      // Fetch transaction details
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        throw new Error('Transaction not found');
      }

      // Prevent reversing already reversed or completed transactions
      if (
        transaction.status === TransactionStatus.REVERSED || 
        transaction.status === TransactionStatus.COMPLETED
      ) {
        throw new Error('Transaction cannot be reversed');
      }

      // Fetch transaction items
      const { data: transactionItems } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transaction_id', transactionId);

      // Adjust inventory in reverse
      await this.adjustStockLevel({
        transaction_id: transactionId,
        transaction_type: TransactionType.REVERSAL,
        user_id: userId,
        user_role: userRole,
        items: transactionItems.map(item => ({
          item_id: item.item_id,
          storeroom_id: item.storeroom_id,
          quantity: item.quantity
        }))
      });

      // Update transaction status to REVERSED
      await supabase
        .from('transactions')
        .update({ 
          status: TransactionStatus.REVERSED,
          reversed_by: userId,
          reversed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

    } catch (error) {
      logService.error('InventoryAuditService.reverseTransaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId
      });
      throw error;
    }
  }
}

export const inventoryAuditService = new InventoryAuditService();
