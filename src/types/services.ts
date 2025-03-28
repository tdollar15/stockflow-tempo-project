import { z } from 'zod';

// Inventory Item Service Type with optional properties
export const InventoryItemServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  category_name: z.string().optional(),
  storeroom_id: z.string().uuid(),
  quantity: z.number().nonnegative(),
  unit_price: z.number().nonnegative().optional(),
  min_quantity: z.number().nonnegative().optional(),
  max_quantity: z.number().nonnegative().optional(),
  last_updated: z.string().datetime(),
  item_id: z.string().uuid().optional()
}).passthrough(); // Allow additional properties

// Storeroom Service Type with optional properties
export const StoreroomServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  location: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  manager_id: z.string().uuid().optional().nullable()
}).passthrough(); // Allow additional properties

// Flexible Service Response Type
export const ServiceResponseSchema = z.object({
  data: z.array(z.any()),
  meta: z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional()
  }).optional()
}).passthrough(); // Allow additional properties

// Type Definitions
export type InventoryItemService = z.infer<typeof InventoryItemServiceSchema>;
export type StoreroomService = z.infer<typeof StoreroomServiceSchema>;
export type ServiceResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    [key: string]: any;
  }
};
