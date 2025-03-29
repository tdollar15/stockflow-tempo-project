import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'supervisor', 'storeman', 'clerk', 'inventory_manager']),
  department: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Storeroom Schema
export const StoreroomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Category Schema
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Item Schema
export const ItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  sku: z.string().min(2).max(50),
  category_id: z.string().uuid(),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).max(20),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Inventory Schema
export const InventorySchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid(),
  storeroom_id: z.string().uuid(),
  quantity: z.number().min(0),
  min_quantity: z.number().min(0),
  max_quantity: z.number().min(0).optional().nullable(),
  last_updated: z.string().datetime(),
});

// Transaction Type Enum
export const TransactionTypeEnum = z.enum([
  'receipt',     // Receiving items into inventory
  'issuance',    // Sending items out of inventory
  'transfer',    // Moving items between storerooms
  'adjustment'   // Correcting inventory levels
]);

// Transaction Status Enum
export const TransactionStatusEnum = z.enum([
  'draft',
  'pending',
  'approved',
  'rejected',
  'completed'
]);

// Transaction Item Schema
export const TransactionItemSchema = z.object({
  item_id: z.string(),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().optional()
});

// Create Transaction Schema with Comprehensive Validation
export const CreateTransactionSchema = z.object({
  type: TransactionTypeEnum,
  created_by: z.string(),
  items: z.array(TransactionItemSchema)
    .min(1, 'At least one transaction item is required')
    .max(50, 'Maximum of 50 items per transaction'),
  source_storeroom_id: z.string().optional().nullable(),
  dest_storeroom_id: z.string().optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  reference_number: z.string().optional().nullable(),
  supplier_name: z.string().optional().nullable(),
}).refine(
  (data) => {
    // Additional cross-field validations
    if (data.type === 'transfer') {
      return data.source_storeroom_id && data.dest_storeroom_id;
    }
    return true;
  },
  { message: 'Source and destination storerooms are required for transfers' }
);

// Update Transaction Status Schema
export const UpdateTransactionStatusSchema = z.object({
  status: TransactionStatusEnum,
  notes: z.string().optional().nullable()
});

// Transaction Filter Schema
export const TransactionFilterSchema = z.object({
  type: TransactionTypeEnum.optional(),
  status: TransactionStatusEnum.optional(),
  created_by: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  sort_by: z.enum(['created_at', 'status', 'type']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

// Transaction Item Details Schema
export const TransactionItemDetailsSchema = TransactionItemSchema.extend({
  id: z.string().uuid(),
  inventory_item_id: z.string().uuid(),
  total_price: z.number().optional()
});

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  transaction_number: z.string(),
  type: TransactionTypeEnum,
  status: TransactionStatusEnum,
  source_storeroom_id: z.string().uuid().optional().nullable(),
  dest_storeroom_id: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  notes: z.string().optional().nullable(),
  reference_number: z.string().optional().nullable(),
  supplier_name: z.string().optional().nullable(),
  transaction_items: z.array(TransactionItemDetailsSchema)
});

// Approval Schema
export const ApprovalSchema = z.object({
  id: z.string().uuid(),
  transaction_id: z.string().uuid(),
  approver_id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected']),
  comments: z.string().optional().nullable(),
  approved_at: z.string().datetime().optional().nullable(),
});

// Validation functions
export function validateUser(data: unknown) {
  return UserSchema.parse(data);
}

export function validateStoreroom(data: unknown) {
  return StoreroomSchema.parse(data);
}

export function validateCategory(data: unknown) {
  return CategorySchema.parse(data);
}

export function validateItem(data: unknown) {
  return ItemSchema.parse(data);
}

export function validateInventory(data: unknown) {
  return InventorySchema.parse(data);
}

export function validateTransaction(data: unknown) {
  return TransactionSchema.parse(data);
}

export function validateTransactionItem(data: unknown) {
  return TransactionItemSchema.parse(data);
}

export function validateApproval(data: unknown) {
  return ApprovalSchema.parse(data);
}

// Optional: Batch validation functions
export function validateUserList(data: unknown[]) {
  return data.map(validateUser);
}

export function validateStoreroomList(data: unknown[]) {
  return data.map(validateStoreroom);
}

// Add more batch validation functions as needed
