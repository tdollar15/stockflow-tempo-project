import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { 
  validateItem, 
  validateInventory 
} from './schema-validation';

// Define input schemas for validation
const CreateItemSchema = z.object({
  name: z.string().min(2).max(100),
  sku: z.string().min(2).max(50),
  category_id: z.string().uuid(),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).max(20)
});

const UpdateItemSchema = CreateItemSchema.partial();

const InventoryFilterSchema = z.object({
  storeroom_id: z.string().uuid().optional(),
  item_name: z.string().optional(),
  category_id: z.string().uuid().optional(),
  min_quantity: z.number().optional(),
  max_quantity: z.number().optional(),
  sort_by: z.enum(['name', 'quantity', 'last_updated']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

// Simulated network delay
function simulateNetworkDelay(minMs = 100, maxMs = 500): Promise<void> {
  const delay = faker.number.int({ min: minMs, max: maxMs });
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Mock error generator
function generateMockError(probability = 0.05): void {
  if (Math.random() < probability) {
    const errorTypes = [
      'NetworkError',
      'ValidationError',
      'PermissionDenied',
      'ResourceNotFound'
    ];
    const errorType = faker.helpers.arrayElement(errorTypes);
    throw new Error(`Simulated ${errorType}`);
  }
}

export class InventoryService {
  // Fetch inventory items with advanced filtering and pagination
  static async getInventoryItems(options: {
    page?: number,
    pageSize?: number,
    filters?: z.infer<typeof InventoryFilterSchema>
  } = {}) {
    await simulateNetworkDelay();
    generateMockError();

    const { 
      page = 1, 
      pageSize = 10, 
      filters = {} 
    } = options;

    // Validate filters
    const validatedFilters = InventoryFilterSchema.parse(filters);

    // Generate mock inventory items
    const totalItems = faker.number.int({ min: 50, max: 500 });
    const inventoryItems = Array.from({ length: pageSize }, () => {
      const item = {
        id: faker.string.uuid(),
        item_id: faker.string.uuid(),
        storeroom_id: validatedFilters.storeroom_id || faker.string.uuid(),
        quantity: faker.number.int({ min: 0, max: 1000 }),
        min_quantity: faker.number.int({ min: 0, max: 50 }),
        max_quantity: faker.number.int({ min: 100, max: 2000 }),
        last_updated: faker.date.recent().toISOString(),
        item_details: {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          sku: faker.string.alphanumeric(10),
          category_id: validatedFilters.category_id || faker.string.uuid(),
          description: faker.commerce.productDescription(),
          unit: faker.helpers.arrayElement(['pcs', 'kg', 'ltr', 'm'])
        }
      };
      
      return validateInventory(item);
    });

    return {
      data: inventoryItems,
      meta: {
        page,
        pageSize,
        total: totalItems,
        filters: validatedFilters
      }
    };
  }

  // Create a single inventory item
  static async createItem(itemData: z.infer<typeof CreateItemSchema>) {
    await simulateNetworkDelay(300, 800);
    generateMockError(0.1);

    // Validate input
    const validatedItem = CreateItemSchema.parse(itemData);

    // Generate mock created item
    const createdItem = {
      ...validatedItem,
      id: faker.string.uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return validateItem(createdItem);
  }

  // Batch create inventory items
  static async createBatchItems(itemsData: z.infer<typeof CreateItemSchema>[]) {
    await simulateNetworkDelay(500, 1500);
    generateMockError(0.1);

    // Validate all items
    const validatedItems = itemsData.map(item => CreateItemSchema.parse(item));

    // Generate mock created items
    const createdItems = validatedItems.map(item => ({
      ...item,
      id: faker.string.uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    return createdItems.map(validateItem);
  }

  // Update an inventory item
  static async updateItem(itemId: string, updateData: z.infer<typeof UpdateItemSchema>) {
    await simulateNetworkDelay(200, 600);
    generateMockError(0.1);

    // Validate update data
    const validatedUpdateData = UpdateItemSchema.parse(updateData);

    // Generate mock updated item
    const updatedItem = {
      id: itemId,
      ...validatedUpdateData,
      updated_at: new Date().toISOString()
    };

    return validateItem(updatedItem);
  }

  // Delete an inventory item
  static async deleteItem(itemId: string) {
    await simulateNetworkDelay(200, 500);
    generateMockError(0.1);

    // Simulate deletion
    return {
      id: itemId,
      deleted: true,
      deletedAt: new Date().toISOString()
    };
  }

  // Batch delete inventory items
  static async deleteBatchItems(itemIds: string[]) {
    await simulateNetworkDelay(300, 1000);
    generateMockError(0.1);

    // Simulate batch deletion
    return itemIds.map(id => ({
      id,
      deleted: true,
      deletedAt: new Date().toISOString()
    }));
  }
}

// Export individual methods for easier importing
export const {
  getInventoryItems,
  createItem,
  createBatchItems,
  updateItem,
  deleteItem,
  deleteBatchItems
} = InventoryService;
