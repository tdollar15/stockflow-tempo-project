import { z } from 'zod';
import { supabase } from '../supabase-client';
import { 
  TransactionStatusEnum, 
  UpdateTransactionStatusSchema 
} from '../schema-validation';
import { toastService } from './ToastService';
import { roleManager } from '../roles';
import { logService } from './LogService';

// Enhanced transaction status tracking
export interface TransactionStatusLog {
  id?: string;
  transaction_id: string;
  old_status: TransactionWorkflowStage;
  new_status: TransactionWorkflowStage;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

// Enum for transaction workflow stages with more detailed states
export enum TransactionWorkflowStage {
  DRAFT = 'draft',
  PENDING_SUPERVISOR_REVIEW = 'pending_supervisor_review',
  SUPERVISOR_REQUESTED_CHANGES = 'supervisor_changes_requested',
  PENDING_ADMIN_REVIEW = 'pending_admin_review',
  ADMIN_REQUESTED_CHANGES = 'admin_changes_requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Detailed status transition matrix
const STATUS_TRANSITION_MATRIX: Record<TransactionWorkflowStage, TransactionWorkflowStage[]> = {
  [TransactionWorkflowStage.DRAFT]: [
    TransactionWorkflowStage.PENDING_SUPERVISOR_REVIEW,
    TransactionWorkflowStage.CANCELLED
  ],
  [TransactionWorkflowStage.PENDING_SUPERVISOR_REVIEW]: [
    TransactionWorkflowStage.SUPERVISOR_REQUESTED_CHANGES,
    TransactionWorkflowStage.PENDING_ADMIN_REVIEW,
    TransactionWorkflowStage.REJECTED
  ],
  [TransactionWorkflowStage.SUPERVISOR_REQUESTED_CHANGES]: [
    TransactionWorkflowStage.DRAFT,
    TransactionWorkflowStage.CANCELLED
  ],
  [TransactionWorkflowStage.PENDING_ADMIN_REVIEW]: [
    TransactionWorkflowStage.ADMIN_REQUESTED_CHANGES,
    TransactionWorkflowStage.APPROVED,
    TransactionWorkflowStage.REJECTED
  ],
  [TransactionWorkflowStage.ADMIN_REQUESTED_CHANGES]: [
    TransactionWorkflowStage.DRAFT,
    TransactionWorkflowStage.CANCELLED
  ],
  [TransactionWorkflowStage.APPROVED]: [
    TransactionWorkflowStage.COMPLETED,
    TransactionWorkflowStage.REJECTED
  ],
  [TransactionWorkflowStage.REJECTED]: [
    TransactionWorkflowStage.DRAFT,
    TransactionWorkflowStage.CANCELLED
  ],
  [TransactionWorkflowStage.COMPLETED]: [],
  [TransactionWorkflowStage.CANCELLED]: []
};

export class TransactionStatusService {
  // Validate and update transaction status
  async updateTransactionStatus(
    userId: string,
    transactionId: string, 
    statusUpdate: z.infer<typeof UpdateTransactionStatusSchema>
  ): Promise<any> {
    try {
      // Validate status update schema
      UpdateTransactionStatusSchema.parse(statusUpdate);

      // Get user role and permissions
      const userRole = await roleManager.getUserRole(userId);

      // Fetch current transaction details
      const { data: currentTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentTransaction) throw new Error('Transaction not found');

      // Validate status transition
      const currentStatus = currentTransaction.status as TransactionWorkflowStage;
      const newStatus = statusUpdate.status as TransactionWorkflowStage;
      this.validateStatusTransition(userRole, currentStatus, newStatus);

      // Prepare status update payload
      const updatePayload = {
        status: newStatus,
        updated_by: userId,
        updated_at: new Date().toISOString(),
        notes: statusUpdate.notes || currentTransaction.notes
      };

      // Update transaction status in database
      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', transactionId)
        .select();

      if (error) throw error;

      // Log status change
      await this.logStatusChange(
        transactionId, 
        currentStatus, 
        newStatus, 
        userId, 
        statusUpdate.notes
      );

      // Notify via toast
      toastService.success(`Transaction status updated to ${newStatus}`);

      return data[0];
    } catch (error) {
      // Comprehensive error logging
      console.error('Transaction status update failed', error);
      logService.error('Transaction Status Update', {
        transactionId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // User-friendly error toast
      toastService.error('Failed to update transaction status');
      throw error;
    }
  }

  // Validate status transition based on user role and current status
  private validateStatusTransition(
    userRole: string, 
    currentStatus: TransactionWorkflowStage, 
    newStatus: TransactionWorkflowStage
  ): void {
    // Check if transition is allowed in the matrix
    const allowedTransitions = STATUS_TRANSITION_MATRIX[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Role-based transition rules
    switch (userRole) {
      case 'storeman':
        // Storemen can only modify draft transactions
        if (currentStatus !== TransactionWorkflowStage.DRAFT) {
          throw new Error('Storemen can only modify draft transactions');
        }
        break;
      case 'supervisor':
        // Supervisors can review and request changes on pending supervisor review
        if (![
          TransactionWorkflowStage.PENDING_SUPERVISOR_REVIEW, 
          TransactionWorkflowStage.SUPERVISOR_REQUESTED_CHANGES
        ].includes(currentStatus)) {
          throw new Error('Supervisors can only modify specific transaction statuses');
        }
        break;
      case 'admin':
        // Admins can review and finalize transactions
        if (![
          TransactionWorkflowStage.PENDING_ADMIN_REVIEW, 
          TransactionWorkflowStage.APPROVED
        ].includes(currentStatus)) {
          throw new Error('Admins can only modify specific transaction statuses');
        }
        break;
      default:
        throw new Error('Unauthorized to update transaction status');
    }
  }

  // Log status change for audit trail
  private async logStatusChange(
    transactionId: string,
    oldStatus: TransactionWorkflowStage,
    newStatus: TransactionWorkflowStage,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      const statusLog: TransactionStatusLog = {
        transaction_id: transactionId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: userId,
        changed_at: new Date().toISOString(),
        reason: reason
      };

      const { error } = await supabase
        .from('transaction_status_logs')
        .insert(statusLog);

      if (error) {
        console.warn('Failed to log status change', error);
      }
    } catch (error) {
      console.error('Error in status change logging', error);
    }
  }

  // Generate comprehensive transaction status summary
  async getTransactionStatusSummary(userId: string): Promise<{
    total: number;
    byStatus: Record<TransactionWorkflowStage, number>;
    byType: Record<string, number>;
  }> {
    try {
      // Get user role and permissions
      const userRole = await roleManager.getUserRole(userId);

      // Base query for transactions
      let query = supabase
        .from('transactions')
        .select('status, type', { count: 'exact' });

      // Apply role-based filtering
      switch (userRole) {
        case 'storeman':
          const assignedStorerooms = await roleManager.getAssignedStorerooms(userId);
          query = query.contains('source_storeroom_id', assignedStorerooms[0] || '');
          break;
        case 'supervisor':
          const supervisorStorerooms = await roleManager.getManagedStorerooms(userId);
          query = query.contains('source_storeroom_id', supervisorStorerooms[0] || '');
          break;
        case 'admin':
          // Admin sees all transactions
          break;
        default:
          throw new Error('Insufficient permissions to view transaction summary');
      }

      // Execute query
      const { data, count, error } = await query;

      if (error) throw error;

      // Aggregate status counts with type safety
      const byStatus = (data || []).reduce((acc, transaction) => {
        const status = transaction.status as TransactionWorkflowStage;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<TransactionWorkflowStage, number>);

      // Aggregate type counts
      const byType = (data || []).reduce((acc, transaction) => {
        acc[transaction.type] = (acc[transaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: count || 0,
        byStatus,
        byType
      };
    } catch (error) {
      console.error('Failed to generate transaction status summary', error);
      toastService.error('Unable to retrieve transaction status summary');
      throw error;
    }
  }
}

export const transactionStatusService = new TransactionStatusService();
