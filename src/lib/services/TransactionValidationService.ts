import { z } from 'zod';
import { 
  TransactionTypeEnum, 
  TransactionItemSchema 
} from '../schema-validation';
import { inventoryService } from './InventoryService';
import { toastService } from './ToastService';

export interface TransactionValidationInput {
  type: z.infer<typeof TransactionTypeEnum>;
  source_storeroom_id?: string | null;
  dest_storeroom_id?: string | null;
  items: z.infer<typeof TransactionItemSchema>[];
  reference_number?: string | null;
}

export class TransactionValidationService {
  // Validate transaction based on type and specific rules
  async validateTransaction(
    transaction: TransactionValidationInput
  ): Promise<boolean> {
    try {
      // Validate transaction type-specific rules
      switch (transaction.type) {
        case 'issuance':
          return await this.validateIssuanceTransaction(transaction);
        
        case 'transfer':
          return await this.validateTransferTransaction(transaction);
        
        case 'receipt':
          return await this.validateReceiptTransaction(transaction);
        
        case 'adjustment':
          return await this.validateAdjustmentTransaction(transaction);
        
        default:
          throw new Error('Invalid transaction type');
      }
    } catch (error) {
      console.error('Transaction validation failed', error);
      toastService.error('Transaction validation failed');
      return false;
    }
  }

  // Validate issuance transaction
  private async validateIssuanceTransaction(
    transaction: TransactionValidationInput
  ): Promise<boolean> {
    // Require source storeroom for issuance
    if (!transaction.source_storeroom_id) {
      toastService.error('Source storeroom is required for issuance');
      return false;
    }

    // Check stock levels for each item
    for (const item of transaction.items) {
      const currentStock = await inventoryService.getItemStockLevel(
        item.item_id, 
        transaction.source_storeroom_id
      );

      if (currentStock < item.quantity) {
        toastService.error(`Insufficient stock for item ${item.item_id}`);
        return false;
      }
    }

    return true;
  }

  // Validate transfer transaction
  private async validateTransferTransaction(
    transaction: TransactionValidationInput
  ): Promise<boolean> {
    // Require both source and destination storerooms
    if (!transaction.source_storeroom_id || !transaction.dest_storeroom_id) {
      toastService.error('Both source and destination storerooms are required for transfer');
      return false;
    }

    // Check stock levels for each item
    for (const item of transaction.items) {
      const currentStock = await inventoryService.getItemStockLevel(
        item.item_id, 
        transaction.source_storeroom_id
      );

      if (currentStock < item.quantity) {
        toastService.error(`Insufficient stock for item ${item.item_id}`);
        return false;
      }
    }

    return true;
  }

  // Validate receipt transaction
  private async validateReceiptTransaction(
    transaction: TransactionValidationInput
  ): Promise<boolean> {
    // Require destination storeroom for receipt
    if (!transaction.dest_storeroom_id) {
      toastService.error('Destination storeroom is required for receipt');
      return false;
    }

    // Optional: Add additional validation for receipts 
    // (e.g., supplier validation, reference number check)
    if (transaction.type === 'receipt' && !transaction.reference_number) {
      toastService.warning('Receipt transactions should have a reference number');
    }

    return true;
  }

  // Validate adjustment transaction
  private async validateAdjustmentTransaction(
    transaction: TransactionValidationInput
  ): Promise<boolean> {
    // Require source storeroom for adjustment
    if (!transaction.source_storeroom_id) {
      toastService.error('Source storeroom is required for adjustment');
      return false;
    }

    // Additional validation for adjustments
    for (const item of transaction.items) {
      // Ensure no negative adjustments exceed current stock
      const currentStock = await inventoryService.getItemStockLevel(
        item.item_id, 
        transaction.source_storeroom_id
      );

      if (item.quantity < 0 && Math.abs(item.quantity) > currentStock) {
        toastService.error(`Negative adjustment exceeds current stock for item ${item.item_id}`);
        return false;
      }
    }

    return true;
  }
}

export const transactionValidationService = new TransactionValidationService();
