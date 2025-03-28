import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';

// Comprehensive Transaction Types
export enum TransactionType {
  Receipt = 'Receipt',
  Issuance = 'Issuance',
  Transfer = 'Transfer',
  Swap = 'Swap'
}

// Expanded Role Definitions
export enum UserRole {
  Clerk = 'Clerk',
  SupplierDriver = 'Supplier Driver',
  Storeman = 'Storeman',
  Supervisor = 'Supervisor',
  SupplierSupervisor = 'Supplier Supervisor',
  Admin = 'Admin'
}

// Comprehensive Transaction Stages
export enum TransactionStage {
  Draft = 'Draft',
  PendingClerkSubmission = 'Pending Clerk Submission',
  PendingSupplierDriverApproval = 'Pending Supplier Driver Approval',
  PendingStoremanApproval = 'Pending Storeman Approval',
  PendingFirstLevelApproval = 'Pending First Level Approval',
  PendingFinalApproval = 'Pending Final Approval',
  Completed = 'Completed',
  Rejected = 'Rejected'
}

// Transaction Flow Configuration
interface TransactionFlowConfig {
  type: TransactionType;
  stages: TransactionStage[];
  roleProgressions: {
    [role in UserRole]?: {
      canInitiate: boolean;
      canApproveStages: TransactionStage[];
    }
  };
}

// Comprehensive Transaction Flow Configurations
const transactionFlowConfigs: TransactionFlowConfig[] = [
  {
    type: TransactionType.Receipt,
    stages: [
      TransactionStage.Draft,
      TransactionStage.PendingClerkSubmission,
      TransactionStage.PendingSupplierDriverApproval,
      TransactionStage.PendingStoremanApproval,
      TransactionStage.PendingFinalApproval,
      TransactionStage.Completed
    ],
    roleProgressions: {
      [UserRole.Clerk]: {
        canInitiate: true,
        canApproveStages: [TransactionStage.PendingClerkSubmission]
      },
      [UserRole.SupplierDriver]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingSupplierDriverApproval]
      },
      [UserRole.Storeman]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingStoremanApproval]
      },
      [UserRole.Supervisor]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingFinalApproval]
      }
    }
  },
  {
    type: TransactionType.Issuance,
    stages: [
      TransactionStage.Draft,
      TransactionStage.PendingClerkSubmission,
      TransactionStage.PendingStoremanApproval,
      TransactionStage.PendingFinalApproval,
      TransactionStage.Completed
    ],
    roleProgressions: {
      [UserRole.Clerk]: {
        canInitiate: true,
        canApproveStages: [TransactionStage.PendingClerkSubmission]
      },
      [UserRole.Storeman]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingStoremanApproval]
      },
      [UserRole.Supervisor]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingFinalApproval]
      }
    }
  },
  {
    type: TransactionType.Transfer,
    stages: [
      TransactionStage.Draft,
      TransactionStage.PendingFirstLevelApproval,
      TransactionStage.PendingFinalApproval,
      TransactionStage.Completed
    ],
    roleProgressions: {
      [UserRole.Storeman]: {
        canInitiate: true,
        canApproveStages: [
          TransactionStage.PendingFirstLevelApproval, 
          TransactionStage.PendingFinalApproval
        ]
      },
      [UserRole.Supervisor]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingFinalApproval]
      }
    }
  },
  {
    type: TransactionType.Swap,
    stages: [
      TransactionStage.Draft,
      TransactionStage.PendingFirstLevelApproval,
      TransactionStage.Completed
    ],
    roleProgressions: {
      [UserRole.Supervisor]: {
        canInitiate: true,
        canApproveStages: [
          TransactionStage.PendingFirstLevelApproval,
          TransactionStage.Completed
        ]
      },
      [UserRole.SupplierSupervisor]: {
        canInitiate: false,
        canApproveStages: [TransactionStage.PendingFirstLevelApproval]
      }
    }
  }
];

interface TransactionWorkflowProps {
  transactionType: TransactionType;
  initialStage?: TransactionStage;
  userRole: UserRole;
  transactionData: any;
  onStageChange: (stage: TransactionStage) => void;
  onSubmit: (data: any) => Promise<void>;
}

export const TransactionWorkflow: React.FC<TransactionWorkflowProps> = ({
  transactionType,
  initialStage = TransactionStage.Draft,
  userRole,
  transactionData,
  onStageChange,
  onSubmit
}) => {
  const [currentStage, setCurrentStage] = useState<TransactionStage>(initialStage);
  const { toast } = useToast();

  // Find the configuration for the current transaction type
  const flowConfig = transactionFlowConfigs.find(
    config => config.type === transactionType
  );

  if (!flowConfig) {
    throw new Error(`No workflow configuration found for transaction type: ${transactionType}`);
  }

  // Determine available stages and permissions for the current user role
  const userPermissions = flowConfig.roleProgressions[userRole] || {
    canInitiate: false,
    canApproveStages: []
  };

  const canProgressToStage = useCallback((targetStage: TransactionStage) => {
    // Check if the user can approve the target stage
    return userPermissions.canApproveStages.includes(targetStage);
  }, [userPermissions]);

  const handleStageProgress = async (targetStage: TransactionStage) => {
    if (!canProgressToStage(targetStage)) {
      toast({
        title: 'Unauthorized Stage Progression',
        description: `You do not have permission to move to ${targetStage} stage.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Simulate stage-specific submission logic
      await onSubmit({
        ...transactionData,
        stage: targetStage,
        transactionType
      });

      setCurrentStage(targetStage);
      onStageChange(targetStage);

      toast({
        title: 'Transaction Stage Updated',
        description: `Transaction moved to ${targetStage}`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Stage Progression Failed',
        description: 'Unable to progress transaction stage.',
        variant: 'destructive'
      });
    }
  };

  const renderStageActions = () => {
    const stageActionMap: Record<TransactionStage, React.ReactNode> = {
      [TransactionStage.Draft]: userPermissions.canInitiate ? (
        <Button 
          onClick={() => handleStageProgress(flowConfig.stages[1])}
          disabled={!userPermissions.canInitiate}
        >
          Submit Transaction
        </Button>
      ) : null,
      [TransactionStage.PendingClerkSubmission]: (
        <>
          <Button 
            variant="secondary" 
            onClick={() => handleStageProgress(TransactionStage.Draft)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleStageProgress(flowConfig.stages[2])}
            disabled={!canProgressToStage(flowConfig.stages[2])}
          >
            Approve and Forward
          </Button>
        </>
      ),
      [TransactionStage.PendingSupplierDriverApproval]: (
        <>
          <Button 
            variant="secondary" 
            onClick={() => handleStageProgress(TransactionStage.Draft)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleStageProgress(flowConfig.stages[3])}
            disabled={!canProgressToStage(flowConfig.stages[3])}
          >
            Approve and Forward
          </Button>
        </>
      ),
      [TransactionStage.PendingStoremanApproval]: (
        <>
          <Button 
            variant="secondary" 
            onClick={() => handleStageProgress(TransactionStage.Draft)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleStageProgress(flowConfig.stages[4])}
            disabled={!canProgressToStage(flowConfig.stages[4])}
          >
            Approve and Forward
          </Button>
        </>
      ),
      [TransactionStage.PendingFirstLevelApproval]: (
        <>
          <Button 
            variant="secondary" 
            onClick={() => handleStageProgress(TransactionStage.Draft)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleStageProgress(flowConfig.stages[flowConfig.stages.length - 1])}
            disabled={!canProgressToStage(flowConfig.stages[flowConfig.stages.length - 1])}
          >
            Approve
          </Button>
        </>
      ),
      [TransactionStage.PendingFinalApproval]: (
        <>
          <Button 
            variant="secondary" 
            onClick={() => handleStageProgress(TransactionStage.Draft)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleStageProgress(TransactionStage.Completed)}
            disabled={!canProgressToStage(TransactionStage.Completed)}
          >
            Final Approval
          </Button>
        </>
      ),
      [TransactionStage.Completed]: (
        <div>Transaction Completed</div>
      ),
      [TransactionStage.Rejected]: (
        <div>Transaction Rejected</div>
      )
    };

    return stageActionMap[currentStage] || null;
  };

  // Calculate progress based on current stage
  const calculateProgress = () => {
    const totalStages = flowConfig.stages.length;
    const currentStageIndex = flowConfig.stages.indexOf(currentStage);
    return Math.round((currentStageIndex / (totalStages - 1)) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transactionType} Transaction Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={calculateProgress()} />
          <div className="text-center font-semibold">
            Current Stage: {currentStage}
          </div>
          <div className="flex justify-center space-x-2">
            {renderStageActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
