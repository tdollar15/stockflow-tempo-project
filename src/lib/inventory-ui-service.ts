import { z } from 'zod';
import { InventoryService } from './inventory-service';
import { StoreroomService } from './storeroom-service';
import { 
  InventoryItem, 
  InventoryFilter, 
  InventoryItemSchema 
} from '@/types/inventory';
import { 
  InventoryItemService, 
  StoreroomService as StoreroomServiceType,
  ServiceResponse 
} from '@/types/services';

// More robust and flexible filter type with default values
type FlexibleFilter = InventoryFilter & {
  [key: string]: any;
  sort_by?: 'category' | 'storeroom' | 'name' | 'quantity' | 'unit_price' | 'last_updated';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// Create a type guard to validate FlexibleFilter
function isValidFlexibleFilter(options: any): options is FlexibleFilter {
  return (
    (options.sort_by === undefined || 
      ['category', 'storeroom', 'name', 'quantity', 'unit_price', 'last_updated'].includes(options.sort_by)) &&
    (options.sort_order === undefined || 
      ['asc', 'desc'].includes(options.sort_order)) &&
    (options.page === undefined || typeof options.page === 'number') &&
    (options.page_size === undefined || typeof options.page_size === 'number')
  );
}

// Default filter options
const DEFAULT_FILTER_OPTIONS: FlexibleFilter = {
  sort_by: 'name',
  sort_order: 'asc',
  page: 1,
  page_size: 10
};

import { supabase } from '@/lib/supabase';

// Inventory Item Update Schema
export const InventoryItemUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  category: z.string().min(1, "Category is required").optional(),
  quantity: z.number().min(0, "Quantity cannot be negative").optional(),
  unit_price: z.number().min(0, "Unit price cannot be negative").optional(),
  storeroom_id: z.string().min(1, "Storeroom is required").optional(),
  status: z.enum(['low_stock', 'optimal', 'overstocked']).optional()
});

export class InventoryUIService {
  // Advanced inventory filtering and search
  static async filterInventoryItems(
    options: FlexibleFilter = DEFAULT_FILTER_OPTIONS
  ): Promise<ServiceResponse<InventoryItem[]>> {
    // Validate input options
    if (!isValidFlexibleFilter(options)) {
      throw new Error('Invalid filter options');
    }

    // Merge default options with provided options
    const validatedOptions: FlexibleFilter = {
      ...DEFAULT_FILTER_OPTIONS,
      ...options,
      // Ensure core filter properties are present
      search: options.search || '',
      category: options.category || undefined,
      storeroom: options.storeroom || undefined,
      min_quantity: options.min_quantity,
      max_quantity: options.max_quantity,
      status: options.status
    };

    // Fetch inventory items with advanced filtering
    const inventoryData = await InventoryService.getInventoryItems({
      filters: {
        item_name: validatedOptions.search,
        category_id: validatedOptions.category,
        storeroom_id: validatedOptions.storeroom,
        min_quantity: validatedOptions.min_quantity,
        max_quantity: validatedOptions.max_quantity
      },
      page: validatedOptions.page,
      pageSize: validatedOptions.page_size,
      // Conditionally add sorting if specified
      ...(validatedOptions.sort_by && validatedOptions.sort_order ? {
        sort: {
          field: validatedOptions.sort_by,
          order: validatedOptions.sort_order
        }
      } : {}),
      // Include any additional filter properties
      ...Object.fromEntries(
        Object.entries(options).filter(([key]) => 
          !Object.keys(DEFAULT_FILTER_OPTIONS).includes(key) &&
          !['search', 'category', 'storeroom', 'min_quantity', 'max_quantity', 'status'].includes(key)
        )
      )
    });

    // Fetch storerooms
    const storeroomsData = await StoreroomService.getStorerooms();

    // Enrich inventory data with additional information
    const enrichedData = await Promise.all(
      (inventoryData.data || []).map(async (rawItem: any) => {
        // Ensure item has all necessary properties
        const item: Partial<InventoryItemService> = rawItem || {};

        // Find storeroom details
        const storeroom = (storeroomsData.data || []).find(
          (s: StoreroomServiceType) => s.id === item.storeroom_id
        );

        // Calculate stock status
        const status = this.calculateStockStatus(
          item.quantity || 0, 
          item.min_quantity || 20, 
          item.max_quantity || 500
        );

        // Validate and transform item to match InventoryItem type
        return InventoryItemSchema.parse({
          id: item.id || '',
          name: item.name || 'Unknown',
          category: item.category_name || 'Uncategorized',
          storeroom_name: storeroom?.name || 'Unknown',
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          status,
          low_stock_warning: status === 'low_stock',
          storeroom_id: item.storeroom_id || '',
          last_updated: item.last_updated || new Date().toISOString()
        });
      })
    );

    return {
      data: enrichedData,
      meta: inventoryData.meta || {}
    };
  }

  // Calculate stock status
  private static calculateStockStatus(
    currentQuantity: number, 
    lowStockThreshold: number, 
    highStockThreshold: number
  ): InventoryItem['status'] {
    if (currentQuantity < lowStockThreshold) return 'low_stock';
    if (currentQuantity > highStockThreshold) return 'overstocked';
    return 'optimal';
  }

  // Prepare data for detailed item view
  static async getInventoryItemDetails(itemId: string): Promise<InventoryItem> {
    // Fetch item details
    const inventoryData = await InventoryService.getInventoryItems({
      filters: { 
        item_name: itemId 
      }
    });
    const rawItem = (inventoryData.data || [])[0];

    if (!rawItem) {
      throw new Error('Inventory item not found');
    }

    // Ensure item has all necessary properties
    const item: Partial<InventoryItemService> = rawItem || {};

    // Fetch storeroom details
    const storeroomsData = await StoreroomService.getStorerooms();
    const storeroom = (storeroomsData.data || []).find(
      (s: StoreroomServiceType) => s.id === item.storeroom_id
    );

    // Calculate stock status
    const status = this.calculateStockStatus(
      item.quantity || 0, 
      item.min_quantity || 20, 
      item.max_quantity || 500
    );

    // Validate and transform item to match InventoryItem type
    return InventoryItemSchema.parse({
      id: item.id || '',
      name: item.name || 'Unknown',
      category: item.category_name || 'Uncategorized',
      storeroom_name: storeroom?.name || 'Unknown',
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      status,
      low_stock_warning: status === 'low_stock',
      storeroom_id: item.storeroom_id || '',
      last_updated: item.last_updated || new Date().toISOString()
    });
  }

  // Edit inventory item
  static async editInventoryItem(
    data: Partial<InventoryItem>, 
    options: FlexibleFilter = DEFAULT_FILTER_OPTIONS
  ): Promise<InventoryItem> {
    // Validate input options
    if (!isValidFlexibleFilter(options)) {
      throw new Error('Invalid filter options');
    }

    // Validate input data
    const validatedData = InventoryItemSchema.partial().parse(data);

    // Perform update using InventoryService 
    const updatedItem = await InventoryService.updateItem(
      validatedData, 
      options
    );

    return updatedItem;
  }

  // Generate export data for inventory
  static async generateInventoryExport(
    options: FlexibleFilter = DEFAULT_FILTER_OPTIONS
  ): Promise<Partial<InventoryItem>[]> {
    // Validate input options
    if (!isValidFlexibleFilter(options)) {
      throw new Error('Invalid filter options');
    }

    const inventoryData = await this.filterInventoryItems(options);

    // Transform data for export
    return inventoryData.data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      storeroom_name: item.storeroom_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      status: item.status
    }));
  }

  // New method to update inventory item
  static async updateInventoryItem(
    itemId: string, 
    updateData: z.infer<typeof InventoryItemUpdateSchema>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate input data
      const validatedData = InventoryItemUpdateSchema.parse(updateData);

      // Check user permissions
      const canUpdate = await RBACService.checkPermission('inventory', 'update');
      if (!canUpdate) {
        return { 
          success: false, 
          message: 'Insufficient permissions to update inventory item' 
        };
      }

      // Perform the update
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          ...validatedData,
          last_updated: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating inventory item:', error);
        return { 
          success: false, 
          message: `Update failed: ${error.message}` 
        };
      }

      // Log the update action
      await RBACService.logAction('inventory', 'update', {
        itemId,
        changes: Object.keys(validatedData)
      });

      return { 
        success: true, 
        message: 'Inventory item updated successfully' 
      };
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return { 
          success: false, 
          message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
        };
      }

      // Handle other unexpected errors
      console.error('Unexpected error updating inventory item:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred while updating the item' 
      };
    }
  }
}

// Export individual methods for easier importing
export const {
  filterInventoryItems,
  getInventoryItemDetails,
  editInventoryItem,
  generateInventoryExport,
  updateInventoryItem
} = InventoryUIService;
