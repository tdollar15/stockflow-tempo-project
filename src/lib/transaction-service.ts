import { z } from 'zod';
import { supabase } from './supabase-client';
import { 
  CreateTransactionSchema, 
  UpdateTransactionStatusSchema,
  TransactionTypeEnum,
  TransactionStatusEnum
} from './schema-validation';

import { transactionValidationService } from './services/TransactionValidationService';
import { transactionStatusService, TransactionWorkflowStage } from './services/TransactionStatusService';
import { toastService } from './services/ToastService';
import { roleManager } from './roles';

// Local type definitions
export interface Transaction {
  id: string;
  transaction_number: string;
  type: z.infer<typeof TransactionTypeEnum>;
  status: z.infer<typeof TransactionStatusEnum>;
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
      const workflowStage = Object.keys(TransactionWorkflowStage)
        .find(key => TransactionWorkflowStage[key as TransactionWorkflowStage] === filters.status);
      
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

  // Create a new transaction with comprehensive validation
  async createTransaction(
    transactionData: z.infer<typeof CreateTransactionSchema>
  ): Promise<Transaction> {
    try {
      // Validate transaction before creation
      const isValid = await transactionValidationService.validateTransaction({
        type: transactionData.type,
        source_storeroom_id: transactionData.source_storeroom_id,
        dest_storeroom_id: transactionData.dest_storeroom_id,
        items: transactionData.items,
        reference_number: transactionData.reference_number
      });

      if (!isValid) {
        throw new Error('Transaction validation failed');
      }

      // Generate transaction number (mock implementation)
      const transactionNumber = this.generateTransactionNumber(transactionData.type);

      // Prepare transaction for database
      const newTransaction: Omit<Transaction, 'id'> = {
        transaction_number: transactionNumber,
        type: transactionData.type,
        status: 'draft',
        source_storeroom_id: transactionData.source_storeroom_id || null,
        dest_storeroom_id: transactionData.dest_storeroom_id || null,
        created_by: transactionData.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: transactionData.notes || null,
        reference_number: transactionData.reference_number || null,
        current_approver_role: null
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select();

      if (error) throw error;

      // Show success toast
      toastService.success(`Transaction ${transactionNumber} created successfully`);

      return data[0] as Transaction;
    } catch (error) {
      // Log and rethrow error
      console.error('Transaction creation failed', error);
      toastService.error('Failed to create transaction');
      throw error;
    }
  }

  // Generate unique transaction number
  private generateTransactionNumber(type: z.infer<typeof TransactionTypeEnum>): string {
    const prefix = {
      'receipt': 'RCP',
      'issuance': 'ISS',
      'transfer': 'TRF',
      'adjustment': 'ADJ'
    }[type];

    const timestamp = new Date().getTime().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  // Update transaction status using the new status service
  async updateTransactionStatus(
    userId: string,
    transactionId: string, 
    statusUpdate: z.infer<typeof UpdateTransactionStatusSchema>
  ): Promise<Transaction> {
    return await transactionStatusService.updateTransactionStatus(
      userId, 
      transactionId, 
      statusUpdate
    );
  }

  // Get transaction status summary
  async getTransactionStatusSummary(userId: string) {
    return await transactionStatusService.getTransactionStatusSummary(userId);
  }

  // Retrieve transaction details with role-based access
  async getTransactionDetails(
    userId: string, 
    transactionId: string
  ): Promise<Transaction & { transaction_items: TransactionItem[] }> {
    try {
      // Get user role
      const userRole = await roleManager.getUserRole(userId);

      // Base query for transaction details
      let query = supabase
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

      // Apply role-based filtering
      switch (userRole) {
        case 'storeman':
          const assignedStorerooms = await roleManager.getAssignedStorerooms(userId);
          query = query.in('source_storeroom_id', assignedStorerooms);
          break;
        case 'supervisor':
          const supervisorStorerooms = await roleManager.getManagedStorerooms(userId);
          query = query.in('source_storeroom_id', supervisorStorerooms);
          break;
        case 'admin':
          // Admin can view all transactions
          break;
        default:
          throw new Error('Insufficient permissions to view transaction details');
      }

      // Execute query
      const { data, error } = await query;

      if (error) throw error;
      if (!data) throw new Error('Transaction not found');

      return data as Transaction & { transaction_items: TransactionItem[] };
    } catch (error) {
      console.error('Failed to retrieve transaction details', error);
      toastService.error('Unable to retrieve transaction details');
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
