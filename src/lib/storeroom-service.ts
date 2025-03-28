import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { 
  validateStoreroom, 
  validateUser,
  validateInventory
} from './schema-validation';

// Input Schemas for Validation
const CreateStoreroomSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional().default('active')
});

const UpdateStoreroomSchema = CreateStoreroomSchema.partial();

const StoreroomFilterSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  manager_id: z.string().uuid().optional(),
  sort_by: z.enum(['name', 'location', 'status']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

const UserStoreroomAssignmentSchema = z.object({
  user_id: z.string().uuid(),
  storeroom_id: z.string().uuid(),
  role: z.enum(['manager', 'staff', 'viewer']).optional().default('staff')
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

// Storeroom Schema
export const StoreroomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Storeroom name must be at least 2 characters"),
  location: z.string().optional(),
  capacity: z.number().min(0, "Capacity cannot be negative").optional(),
  current_occupancy: z.number().min(0, "Occupancy cannot be negative").optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active')
});

export type Storeroom = z.infer<typeof StoreroomSchema>;

export class StoreroomService {
  // Create a new storeroom
  static async createStoreroom(storeroomData: z.infer<typeof CreateStoreroomSchema>) {
    await simulateNetworkDelay(300, 800);
    generateMockError(0.1);

    // Validate input
    const validatedStoreroom = CreateStoreroomSchema.parse(storeroomData);

    // Generate mock storeroom
    const storeroom = {
      id: faker.string.uuid(),
      ...validatedStoreroom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return validateStoreroom(storeroom);
  }

  // Get storerooms with advanced filtering
  static async getStorerooms(options: {
    page?: number,
    pageSize?: number,
    filters?: z.infer<typeof StoreroomFilterSchema>
  } = {}) {
    await simulateNetworkDelay();
    generateMockError();

    const { 
      page = 1, 
      pageSize = 10, 
      filters = {} 
    } = options;

    // Validate filters
    const validatedFilters = StoreroomFilterSchema.parse(filters);

    // Generate mock storerooms
    const totalStorerooms = faker.number.int({ min: 10, max: 50 });
    const storerooms = Array.from({ length: pageSize }, () => {
      const storeroom = {
        id: faker.string.uuid(),
        name: validatedFilters.name || `${faker.commerce.department()} Warehouse`,
        location: validatedFilters.location || faker.location.streetAddress(),
        manager_id: validatedFilters.manager_id || faker.string.uuid(),
        status: validatedFilters.status || faker.helpers.arrayElement(['active', 'inactive', 'maintenance']),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      };
      
      return validateStoreroom(storeroom);
    });

    return {
      data: storerooms,
      meta: {
        page,
        pageSize,
        total: totalStorerooms,
        filters: validatedFilters
      }
    };
  }

  // Update a storeroom
  static async updateStoreroom(
    storeroomId: string, 
    updateData: z.infer<typeof UpdateStoreroomSchema>
  ) {
    await simulateNetworkDelay(200, 600);
    generateMockError(0.1);

    // Validate update data
    const validatedUpdateData = UpdateStoreroomSchema.parse(updateData);

    // Generate mock updated storeroom
    const updatedStoreroom = {
      id: storeroomId,
      ...validatedUpdateData,
      updated_at: new Date().toISOString()
    };

    return validateStoreroom(updatedStoreroom);
  }

  // Delete a storeroom
  static async deleteStoreroom(storeroomId: string) {
    await simulateNetworkDelay(200, 500);
    generateMockError(0.1);

    // Simulate deletion
    return {
      id: storeroomId,
      deleted: true,
      deletedAt: new Date().toISOString()
    };
  }

  // Assign user to storeroom
  static async assignUserToStoreroom(
    assignmentData: z.infer<typeof UserStoreroomAssignmentSchema>
  ) {
    await simulateNetworkDelay(200, 500);
    generateMockError(0.1);

    // Validate assignment data
    const validatedAssignment = UserStoreroomAssignmentSchema.parse(assignmentData);

    // Generate mock user and storeroom details
    const assignment = {
      ...validatedAssignment,
      assigned_at: new Date().toISOString()
    };

    return assignment;
  }

  // Get users assigned to a storeroom
  static async getStoreroomUsers(storeroomId: string) {
    await simulateNetworkDelay();
    generateMockError();

    // Generate mock users assigned to the storeroom
    const userCount = faker.number.int({ min: 1, max: 10 });
    const users = Array.from({ length: userCount }, () => {
      const user = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(['manager', 'staff', 'viewer']),
        assigned_at: faker.date.past().toISOString()
      };
      
      return validateUser(user);
    });

    return users;
  }

  // Get inventory items in a specific storeroom
  static async getStoreroomInventory(
    storeroomId: string, 
    options: { 
      page?: number, 
      pageSize?: number 
    } = {}
  ) {
    await simulateNetworkDelay();
    generateMockError();

    const { 
      page = 1, 
      pageSize = 10 
    } = options;

    // Generate mock inventory items for the storeroom
    const totalItems = faker.number.int({ min: 50, max: 500 });
    const inventoryItems = Array.from({ length: pageSize }, () => {
      const item = {
        id: faker.string.uuid(),
        item_id: faker.string.uuid(),
        storeroom_id: storeroomId,
        quantity: faker.number.int({ min: 0, max: 1000 }),
        min_quantity: faker.number.int({ min: 0, max: 50 }),
        max_quantity: faker.number.int({ min: 100, max: 2000 }),
        last_updated: faker.date.recent().toISOString(),
        item_details: {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          sku: faker.string.alphanumeric(10),
          category_id: faker.string.uuid(),
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
        storeroom_id: storeroomId
      }
    };
  }

  // Fetch available storerooms for inventory item selection
  static async getAvailableStorerooms(): Promise<Storeroom[]> {
    try {
      const { data, error } = await supabase
        .from('storerooms')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching storerooms:', error);
        throw new Error(`Failed to fetch storerooms: ${error.message}`);
      }

      // Validate each storeroom
      return data.map(storeroom => {
        try {
          return StoreroomSchema.parse({
            id: storeroom.id,
            name: storeroom.name,
            location: storeroom.location,
            capacity: storeroom.capacity,
            current_occupancy: storeroom.current_occupancy,
            status: storeroom.status
          });
        } catch (validationError) {
          console.warn('Invalid storeroom data:', validationError);
          return null;
        }
      }).filter(Boolean) as Storeroom[];
    } catch (error) {
      console.error('Unexpected error in getAvailableStorerooms:', error);
      throw error;
    }
  }

  // Get storeroom details by ID
  static async getStoreroomById(storeroomId: string): Promise<Storeroom | null> {
    try {
      const { data, error } = await supabase
        .from('storerooms')
        .select('*')
        .eq('id', storeroomId)
        .single();

      if (error) {
        console.error('Error fetching storeroom details:', error);
        return null;
      }

      return StoreroomSchema.parse(data);
    } catch (error) {
      console.error('Validation error for storeroom:', error);
      return null;
    }
  }
}

// Export individual methods for easier importing
export const {
  createStoreroom,
  getStorerooms,
  updateStoreroom,
  deleteStoreroom,
  assignUserToStoreroom,
  getStoreroomUsers,
  getStoreroomInventory,
  getAvailableStorerooms,
  getStoreroomById
} = StoreroomService;
