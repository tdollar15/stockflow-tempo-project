import { z } from 'zod';

// Inventory Item Schema
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string().optional(),
  storeroom_name: z.string(),
  quantity: z.number().nonnegative(),
  unit_price: z.number().nonnegative(),
  status: z.enum(['low_stock', 'optimal', 'overstocked']),
  low_stock_warning: z.boolean().optional(),
  storeroom_id: z.string().uuid(),
  last_updated: z.string().datetime()
});

// Inventory Filter Schema
export const InventoryFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  storeroom: z.string().optional(),
  min_quantity: z.number().nonnegative().optional(),
  max_quantity: z.number().nonnegative().optional(),
  status: z.enum(['low_stock', 'optimal', 'overstocked']).optional(),
  sort_by: z.enum([
    'name', 
    'quantity', 
    'category', 
    'storeroom', 
    'unit_price', 
    'last_updated'
  ]).optional().default('name'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.number().positive().optional().default(1),
  page_size: z.number().positive().optional().default(10)
});

// Type definitions for TypeScript
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryFilter = z.infer<typeof InventoryFilterSchema>;

// Utility functions
export const statusColors: Record<InventoryItem['status'], string> = {
  'low_stock': 'bg-red-100 text-red-800',
  'optimal': 'bg-green-100 text-green-800',
  'overstocked': 'bg-yellow-100 text-yellow-800'
};
