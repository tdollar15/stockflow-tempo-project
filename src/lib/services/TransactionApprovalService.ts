import { z } from 'zod';
import { UserRole } from '../types/UserTypes';
import { 
  Transaction, 
  TransactionStatus, 
  TransactionType, 
  ApprovalWorkflow 
} from '../types/TransactionTypes';

export class TransactionApprovalService {
  // Mock workflows (to be replaced with actual configuration)
  private static defaultWorkflows: ApprovalWorkflow[] = [
    {
      id: 'receipt-workflow',
      transactionType: TransactionType.RECEIPT,
      stages: [
        {
          id: 'delivery-verification',
          name: 'Delivery Verification',
          requiredRoles: [UserRole.SUPPLIER_DELIVERY_GUY],
          minimumApprovals: 1
        },
        {
          id: 'supplier-supervisor-approval',
          name: 'Supplier Supervisor Approval',
          requiredRoles: [UserRole.SUPPLIER_SUPERVISOR],
          minimumApprovals: 1
        },
        {
          id: 'final-approval',
          name: 'Final Approval',
          requiredRoles: [UserRole.SUPERVISOR, UserRole.ADMIN],
          minimumApprovals: 1
        }
      ]
    }
  ];

  // Determine if a user can approve a transaction at the current stage
  canApprove(
    user: { id: string, role: UserRole }, 
    transaction: Transaction
  ): boolean {
    const workflow = this.getWorkflowForTransaction(transaction);
    const currentStage = workflow.stages.find(
      stage => stage.id === transaction.approvalStage
    );

    if (!currentStage) {
      return false;
    }

    return currentStage.requiredRoles.includes(user.role);
  }

  // Progress the transaction through approval stages
  progressTransaction(
    transaction: Transaction, 
    approvingUser: { id: string, role: UserRole }
  ): Transaction {
    // Validate that the user can approve at this stage
    if (!this.canApprove(approvingUser, transaction)) {
      throw new Error('User not authorized to approve at this stage');
    }

    const workflow = this.getWorkflowForTransaction(transaction);
    const currentStageIndex = workflow.stages.findIndex(
      stage => stage.id === transaction.approvalStage
    );

    // If no current stage, start from the first stage
    const effectiveStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
    const currentStage = workflow.stages[effectiveStageIndex];

    // Check if we can progress to the next stage
    if (effectiveStageIndex < workflow.stages.length - 1) {
      return {
        ...transaction,
        approvalStage: workflow.stages[effectiveStageIndex + 1].id,
        status: TransactionStatus.IN_PROGRESS
      };
    }

    // If we've reached the final stage, mark as approved
    return {
      ...transaction,
      status: TransactionStatus.APPROVED,
      approvalStage: undefined
    };
  }

  // Get the workflow for a specific transaction type
  getWorkflowForTransaction(transaction: Transaction): ApprovalWorkflow {
    const workflow = TransactionApprovalService.defaultWorkflows.find(
      w => w.transactionType === transaction.type
    );

    if (!workflow) {
      throw new Error(`No workflow found for transaction type: ${transaction.type}`);
    }

    return workflow;
  }

  // Initialize a transaction with its first approval stage
  initializeTransactionApproval(transaction: Transaction): Transaction {
    const workflow = this.getWorkflowForTransaction(transaction);
    
    return {
      ...transaction,
      status: TransactionStatus.PENDING_APPROVAL,
      approvalStage: workflow.stages[0].id
    };
  }
}

export const transactionApprovalService = new TransactionApprovalService();
