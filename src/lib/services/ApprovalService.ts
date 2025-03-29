import { z } from 'zod';
import { UserRole } from '@/lib/types/UserTypes';
import { 
  TransactionType, 
  TransactionStatus, 
  Transaction, 
  ApprovalStage, 
  ApprovalWorkflow 
} from '@/lib/types/TransactionTypes';
import { supabase } from '@/lib/supabase-client';
import { logService } from '@/lib/services/LogService';

export class ApprovalService {
  // Progress transaction through approval workflow
  async progressTransaction(
    transaction: Transaction, 
    workflow: ApprovalWorkflow
  ): Promise<Transaction> {
    try {
      // Find current stage index
      const currentStageIndex = workflow.stages.findIndex(
        (stage: ApprovalStage) => stage.id === transaction.approvalStage
      );

      if (currentStageIndex === -1) {
        throw new Error('Current approval stage not found');
      }

      const currentStage = workflow.stages[currentStageIndex];

      // TODO: Implement comprehensive approval tracking and validation
      // Current implementation is a simplified placeholder
      if (currentStageIndex < workflow.stages.length - 1) {
        // Move to next stage
        const nextStage = workflow.stages[currentStageIndex + 1];
        
        return {
          ...transaction,
          status: TransactionStatus.IN_PROGRESS,
          approvalStage: nextStage.id
        };
      } else {
        // Final stage - complete transaction
        return {
          ...transaction,
          status: TransactionStatus.COMPLETED,
          approvalStage: undefined
        };
      }
    } catch (error) {
      logService.error('ApprovalService.progressTransaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transaction,
        workflow
      });
      throw error;
    }
  }

  // Check if a user can approve at the current stage
  canApprove(
    user: { id: string, role: UserRole }, 
    transaction: Transaction, 
    workflow: ApprovalWorkflow
  ): boolean {
    try {
      // Find current stage
      const currentStage = workflow.stages.find(
        (stage: ApprovalStage) => stage.id === transaction.approvalStage
      );

      if (!currentStage) {
        return false;
      }

      // Check if user's role is allowed in current stage
      return currentStage.requiredRoles.includes(user.role);
    } catch (error) {
      logService.error('ApprovalService.canApprove', {
        error: error instanceof Error ? error.message : 'Unknown error',
        user,
        transaction,
        workflow
      });
      return false;
    }
  }

  // Get initial workflow for a transaction type
  async getWorkflowForTransactionType(
    transactionType: TransactionType
  ): Promise<ApprovalWorkflow> {
    try {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('transactionType', transactionType)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logService.error('ApprovalService.getWorkflowForTransactionType', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionType
      });
      throw error;
    }
  }

  // Create a new approval workflow
  async createApprovalWorkflow(
    workflowData: ApprovalWorkflow
  ): Promise<ApprovalWorkflow> {
    try {
      const { data, error } = await supabase
        .from('approval_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logService.error('ApprovalService.createApprovalWorkflow', {
        error: error instanceof Error ? error.message : 'Unknown error',
        workflowData
      });
      throw error;
    }
  }
}

export const approvalService = new ApprovalService();
