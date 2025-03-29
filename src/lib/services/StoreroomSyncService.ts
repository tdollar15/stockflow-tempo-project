import { z } from 'zod';
import { supabase } from '$lib/supabaseClient';
import { StoreroomService } from '../storeroom-service';
import { InventoryService } from '../inventory-service';
import { UserRole } from '../types/UserTypes';
import { logService } from './LogService';

// Cross-storeroom transfer schema
export const CrossStoreroomTransferSchema = z.object({
  source_storeroom_id: z.string().uuid(),
  destination_storeroom_id: z.string().uuid(),
  items: z.array(z.object({
    item_id: z.string().uuid(),
    quantity: z.number().positive()
  })),
  transfer_reason: z.string().optional(),
  initiated_by: z.string().uuid(),
  initiated_at: z.date().default(() => new Date())
});

export class StoreroomSyncService {
  // Implement cross-storeroom transfers
  async transferBetweenStorerooms(
    transferDetails: z.infer<typeof CrossStoreroomTransferSchema>
  ): Promise<void> {
    try {
      // Validate transfer details
      const validatedTransfer = CrossStoreroomTransferSchema.parse(transferDetails);

      // Verify source and destination storerooms exist
      const sourceStoreroom = await StoreroomService.getStorerooms({
        filters: { id: validatedTransfer.source_storeroom_id }
      });

      const destinationStoreroom = await StoreroomService.getStorerooms({
        filters: { id: validatedTransfer.destination_storeroom_id }
      });

      if (!sourceStoreroom.data.length || !destinationStoreroom.data.length) {
        throw new Error('Invalid source or destination storeroom');
      }

      // Process each item transfer
      for (const item of validatedTransfer.items) {
        // Deduct from source storeroom
        await this.adjustStoreroomInventory(
          validatedTransfer.source_storeroom_id, 
          item.item_id, 
          -item.quantity
        );

        // Add to destination storeroom
        await this.adjustStoreroomInventory(
          validatedTransfer.destination_storeroom_id, 
          item.item_id, 
          item.quantity
        );
      }

      // Log transfer event
      await this.logStoreroomTransfer(validatedTransfer);

    } catch (error) {
      logService.error('StoreroomSyncService.transferBetweenStorerooms', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transferDetails
      });
      throw error;
    }
  }

  // Verify storeroom balance and capacity
  async verifyStoreroomBalance(
    storeroomId: string, 
    userRole: UserRole
  ): Promise<{
    total_items: number;
    total_value: number;
    capacity_percentage: number;
    low_stock_items: Array<{
      item_id: string;
      current_quantity: number;
      min_quantity: number;
    }>
  }> {
    try {
      // Verify user permissions
      if (userRole !== 'admin' && userRole !== 'supervisor') {
        throw new Error('Insufficient permissions');
      }

      // Fetch storeroom details
      const storeroomDetails = await StoreroomService.getStorerooms({
        filters: { id: storeroomId }
      });

      if (!storeroomDetails.data.length) {
        throw new Error('Storeroom not found');
      }

      // Get inventory items in the storeroom
      const inventoryItems = await InventoryService.getInventoryItems({
        filters: { storeroom_id: storeroomId }
      });

      // Calculate total items and value
      const total_items = inventoryItems.data.reduce(
        (sum, item) => sum + item.quantity, 
        0
      );

      const total_value = inventoryItems.data.reduce(
        (sum, item) => sum + (item.quantity * (item.item_details.unit_price || 0)), 
        0
      );

      // Calculate capacity percentage
      const capacity_percentage = storeroomDetails.data[0].capacity 
        ? (total_items / storeroomDetails.data[0].capacity) * 100 
        : 0;

      // Identify low stock items
      const low_stock_items = inventoryItems.data
        .filter(item => item.quantity < item.min_quantity)
        .map(item => ({
          item_id: item.item_id,
          current_quantity: item.quantity,
          min_quantity: item.min_quantity
        }));

      return {
        total_items,
        total_value,
        capacity_percentage,
        low_stock_items
      };

    } catch (error) {
      logService.error('StoreroomSyncService.verifyStoreroomBalance', {
        error: error instanceof Error ? error.message : 'Unknown error',
        storeroomId
      });
      throw error;
    }
  }

  // Adjust inventory for a specific storeroom
  private async adjustStoreroomInventory(
    storeroomId: string, 
    itemId: string, 
    quantityChange: number
  ): Promise<void> {
    try {
      // Fetch current inventory item
      const inventoryItems = await InventoryService.getInventoryItems({
        filters: { 
          storeroom_id: storeroomId, 
          item_name: itemId 
        }
      });

      if (!inventoryItems.data.length) {
        throw new Error('Inventory item not found in storeroom');
      }

      const currentItem = inventoryItems.data[0];
      const newQuantity = currentItem.quantity + quantityChange;

      // Prevent negative quantities
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory for transfer');
      }

      // Update inventory
      await InventoryService.updateItem(currentItem.id, { 
        quantity: newQuantity 
      });

    } catch (error) {
      logService.error('StoreroomSyncService.adjustStoreroomInventory', {
        error: error instanceof Error ? error.message : 'Unknown error',
        storeroomId,
        itemId,
        quantityChange
      });
      throw error;
    }
  }

  // Log storeroom transfer details
  private async logStoreroomTransfer(
    transferDetails: z.infer<typeof CrossStoreroomTransferSchema>
  ): Promise<void> {
    try {
      await supabase
        .from('storeroom_transfers')
        .insert({
          source_storeroom_id: transferDetails.source_storeroom_id,
          destination_storeroom_id: transferDetails.destination_storeroom_id,
          items: transferDetails.items,
          transfer_reason: transferDetails.transfer_reason,
          initiated_by: transferDetails.initiated_by,
          initiated_at: transferDetails.initiated_at.toISOString()
        });
    } catch (error) {
      logService.error('StoreroomSyncService.logStoreroomTransfer', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transferDetails
      });
    }
  }
}

export const storeroomSyncService = new StoreroomSyncService();
