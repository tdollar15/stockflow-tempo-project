import { z } from 'zod';
import { UserRole } from '../types/UserTypes';
import { TransactionType, TransactionStatus } from '../types/TransactionTypes';
import { ApprovalRecordSchema } from './ApprovalService';

// Approval event schema
export const ApprovalEventSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.nativeEnum(UserRole),
  action: z.enum(['APPROVE', 'REJECT']),
  timestamp: z.date(),
  stage: z.string(),
  transactionType: z.nativeEnum(TransactionType)
});

// Approval metrics schema
export const ApprovalMetricsSchema = z.object({
  totalPendingApprovals: z.number(),
  approvalRate: z.number().min(0).max(1),
  averageApprovalTime: z.number(), // in hours
  approvalsByRole: z.record(z.nativeEnum(UserRole), z.number()),
  approvalsByTransactionType: z.record(z.nativeEnum(TransactionType), z.number())
});

export class ApprovalDashboardService {
  // Mock storage for approval events and records
  private static approvalEvents: z.infer<typeof ApprovalEventSchema>[] = [];
  private static approvalRecords: z.infer<typeof ApprovalRecordSchema>[] = [];

  // Fetch pending approvals for a specific user
  getPendingApprovals(
    userId: string, 
    userRole: UserRole, 
    options?: { 
      page?: number, 
      pageSize?: number, 
      transactionType?: TransactionType 
    }
  ): z.infer<typeof ApprovalRecordSchema>[] {
    const { page = 1, pageSize = 10, transactionType } = options || {};

    return ApprovalDashboardService.approvalRecords.filter(record => 
      // Filter by current stage
      record.currentStage && 
      // Check if user's role is allowed in current stage
      record.currentStage.requiredRoles.includes(userRole) &&
      // Optional transaction type filter
      (!transactionType || record.status === TransactionStatus.IN_PROGRESS)
    )
    .slice((page - 1) * pageSize, page * pageSize);
  }

  // Log an approval or rejection event
  logApprovalEvent(
    event: z.infer<typeof ApprovalEventSchema>
  ): void {
    ApprovalDashboardService.approvalEvents.push(event);
  }

  // Calculate approval metrics
  calculateApprovalMetrics(): z.infer<typeof ApprovalMetricsSchema> {
    const totalTransactions = ApprovalDashboardService.approvalRecords.length;
    const completedTransactions = ApprovalDashboardService.approvalRecords.filter(
      record => record.status === TransactionStatus.APPROVED
    ).length;

    // Calculate metrics
    const metrics: z.infer<typeof ApprovalMetricsSchema> = {
      totalPendingApprovals: totalTransactions - completedTransactions,
      approvalRate: completedTransactions / totalTransactions,
      averageApprovalTime: this.calculateAverageApprovalTime(),
      approvalsByRole: this.calculateApprovalsByRole(),
      approvalsByTransactionType: this.calculateApprovalsByTransactionType()
    };

    return metrics;
  }

  // Helper method to calculate average approval time
  private calculateAverageApprovalTime(): number {
    // This is a simplified implementation
    // In a real-world scenario, you'd track actual timestamps
    return 0; // Placeholder
  }

  // Helper method to count approvals by role
  private calculateApprovalsByRole(): Record<UserRole, number> {
    const roleApprovals: Partial<Record<UserRole, number>> = {};

    ApprovalDashboardService.approvalEvents.forEach(event => {
      if (event.action === 'APPROVE') {
        roleApprovals[event.userRole] = (roleApprovals[event.userRole] || 0) + 1;
      }
    });

    return roleApprovals as Record<UserRole, number>;
  }

  // Helper method to count approvals by transaction type
  private calculateApprovalsByTransactionType(): Record<TransactionType, number> {
    const typeApprovals: Partial<Record<TransactionType, number>> = {};

    ApprovalDashboardService.approvalEvents.forEach(event => {
      if (event.action === 'APPROVE') {
        typeApprovals[event.transactionType] = 
          (typeApprovals[event.transactionType] || 0) + 1;
      }
    });

    return typeApprovals as Record<TransactionType, number>;
  }
}

export const approvalDashboardService = new ApprovalDashboardService();
