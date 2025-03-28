import { z } from 'zod';
import { supabase } from './supabase-client';
import { Database } from './database.types';
import { RoleManager, roleManager } from './roles';

import { 
  TransactionSchema, 
  TransactionTypeEnum, 
  TransactionStatusEnum,
  CreateTransactionSchema,
  UpdateTransactionStatusSchema
} from './schema-validation';

// Transaction workflow stages
export enum TransactionWorkflowStage {
  DRAFT = 'draft',
  PENDING_SUPERVISOR_APPROVAL = 'pending_supervisor',
  PENDING_ADMIN_APPROVAL = 'pending_admin',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

// Mapping workflow stages to old status types for compatibility
const WORKFLOW_TO_STATUS_MAP: Record<TransactionWorkflowStage, string> = {
  [TransactionWorkflowStage.DRAFT]: 'draft',
  [TransactionWorkflowStage.PENDING_SUPERVISOR_APPROVAL]: 'pending',
  [TransactionWorkflowStage.PENDING_ADMIN_APPROVAL]: 'pending',
  [TransactionWorkflowStage.APPROVED]: 'approved',
  [TransactionWorkflowStage.REJECTED]: 'rejected',
  [TransactionWorkflowStage.COMPLETED]: 'completed'
};

// Local type definitions
export interface Transaction {
  id: string;
  transaction_number: string;
  type: 'receipt' | 'issuance' | 'transfer' | 'adjustment';
  status: TransactionWorkflowStage;
  source_storeroom_id?: string | null;
  dest_storeroom_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  reference_number?: string | null;
  supplier_name?: string | null;
  current_approver_role?: 'supervisor' | 'admin' | null;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price?: number | null;
  total_price?: number | null;
  notes?: string | null;
}

export class TransactionService {
  private roleManager: RoleManager;

  constructor() {
    this.roleManager = roleManager;
  }

  // Advanced transaction filtering with role-based access control
  async getTransactions(
    userId: string, 
    filters: {
      type?: z.infer<typeof TransactionTypeEnum>,
      status?: z.infer<typeof TransactionStatusEnum>,
      startDate?: Date,
      endDate?: Date,
      page?: number,
      pageSize?: number
    } = {}
  ) {
    // Determine user's role and permissions
    const userRole = await this.roleManager.getUserRole(userId);
    
    let query = supabase.from('transactions').select('*');

    // Role-based filtering
    switch (userRole) {
      case 'storeman':
        // Storeman can only see transactions from their assigned storeroom
        const assignedStorerooms = await this.roleManager.getAssignedStorerooms(userId);
        query = query.in('source_storeroom_id', assignedStorerooms);
        break;
      case 'supervisor':
        // Supervisor can see transactions for their managed storerooms
        const supervisorStorerooms = await this.roleManager.getManagedStorerooms(userId);
        query = query.in('source_storeroom_id', supervisorStorerooms);
        break;
      case 'admin':
        // Admin can see all transactions
        break;
      default:
        // Restrict access for other roles
        throw new Error('Insufficient permissions to view transactions');
    }

    // Additional filtering logic
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      // Convert status to workflow stage
      const workflowStage = Object.keys(WORKFLOW_TO_STATUS_MAP)
        .find(key => WORKFLOW_TO_STATUS_MAP[key as TransactionWorkflowStage] === filters.status);
      
      if (workflowStage) {
        query = query.eq('status', workflowStage);
      }
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      transactions: data as Transaction[],
      totalCount: count,
      page,
      pageSize
    };
  }

  // Get detailed transaction view with role-based access control
  async getTransactionDetails(userId: string, transactionId: string) {
    const userRole = await this.roleManager.getUserRole(userId);
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          id,
          inventory_item_id,
          quantity,
          unit_price
        )
      `)
      .eq('id', transactionId)
      .single();

    if (error) throw error;

    // Role-based access control for transaction details
    switch (userRole) {
      case 'storeman':
        const assignedStorerooms = await this.roleManager.getAssignedStorerooms(userId);
        if (!assignedStorerooms.includes(data.source_storeroom_id)) {
          throw new Error('Unauthorized access to transaction');
        }
        break;
      case 'supervisor':
        const supervisorStorerooms = await this.roleManager.getManagedStorerooms(userId);
        if (!supervisorStorerooms.includes(data.source_storeroom_id)) {
          throw new Error('Unauthorized access to transaction');
        }
        break;
      case 'admin':
        // Admin can access all transactions
        break;
      default:
        throw new Error('Insufficient permissions to view transaction details');
    }

    return data as Transaction & { transaction_items: TransactionItem[] };
  }

  // Create a transaction with role-based restrictions
  async createTransaction(
    userId: string, 
    transactionData: z.infer<typeof CreateTransactionSchema>
  ) {
    const userRole = await this.roleManager.getUserRole(userId);

    // Only storemen and clerks can create transactions
    if (!['storeman', 'clerk'].includes(userRole)) {
      throw new Error('Unauthorized to create transactions');
    }

    // Validate transaction data
    const validatedData = CreateTransactionSchema.parse({
      ...transactionData,
      created_by: userId,
      status: TransactionWorkflowStage.DRAFT,
      current_approver_role: 'supervisor'
    });

    const { data, error } = await supabase
      .from('transactions')
      .insert(validatedData)
      .select();

    if (error) throw error;

    return data[0] as Transaction;
  }

  // Update transaction status with multi-stage workflow
  async updateTransactionStatus(
    userId: string,
    transactionId: string, 
    status: z.infer<typeof TransactionStatusEnum>
  ) {
    const userRole = await this.roleManager.getUserRole(userId);
    
    // Fetch current transaction to determine workflow
    const currentTransaction = await this.getTransactionDetails(userId, transactionId);

    // Convert status to workflow stage
    const workflowStage = Object.keys(WORKFLOW_TO_STATUS_MAP)
      .find(key => WORKFLOW_TO_STATUS_MAP[key as TransactionWorkflowStage] === status);

    if (!workflowStage) {
      throw new Error('Invalid transaction status');
    }

    // Mutable variable for workflow stage
    let currentWorkflowStage = workflowStage;

    // Role-based status update logic
    switch (currentTransaction.current_approver_role) {
      case 'supervisor':
        if (userRole !== 'supervisor') {
          throw new Error('Only supervisors can approve this transaction');
        }
        // Move to admin approval if approved
        if (currentWorkflowStage === TransactionWorkflowStage.APPROVED) {
          currentWorkflowStage = TransactionWorkflowStage.PENDING_ADMIN_APPROVAL;
        }
        break;
      case 'admin':
        if (userRole !== 'admin') {
          throw new Error('Only admins can give final approval');
        }
        break;
      default:
        throw new Error('Invalid transaction workflow stage');
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        status: currentWorkflowStage, 
        updated_by: userId,
        updated_at: new Date().toISOString(),
        current_approver_role: currentWorkflowStage === TransactionWorkflowStage.PENDING_ADMIN_APPROVAL 
          ? 'admin' 
          : null
      })
      .eq('id', transactionId)
      .select();

    if (error) throw error;

    return data[0] as Transaction;
  }

  // Generate transaction status visualization data with role-based filtering
  async getTransactionStatusSummary(userId: string) {
    const userRole = await this.roleManager.getUserRole(userId);
    
    let query = supabase.from('transactions').select('status');

    // Role-based filtering for status summary
    switch (userRole) {
      case 'storeman':
        const assignedStorerooms = await this.roleManager.getAssignedStorerooms(userId);
        query = query.in('source_storeroom_id', assignedStorerooms);
        break;
      case 'supervisor':
        const supervisorStorerooms = await this.roleManager.getManagedStorerooms(userId);
        query = query.in('source_storeroom_id', supervisorStorerooms);
        break;
      case 'admin':
        // Admin sees all transactions
        break;
      default:
        throw new Error('Insufficient permissions to view transaction summary');
    }

    const { data, error } = await query;

    if (error) throw error;

    const statusCounts = data?.reduce((acc: Record<string, number>, transaction) => {
      const mappedStatus = WORKFLOW_TO_STATUS_MAP[transaction.status as TransactionWorkflowStage];
      acc[mappedStatus] = (acc[mappedStatus] || 0) + 1;
      return acc;
    }, {});

    return {
      statusCounts,
      totalTransactions: data?.length || 0
    };
  }
}

// Instantiate service
export const transactionService = new TransactionService();
