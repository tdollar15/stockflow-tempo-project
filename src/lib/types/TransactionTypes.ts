import { UserRole } from './UserTypes';

export enum TransactionType {
  RECEIPT = 'RECEIPT',
  ISSUANCE = 'ISSUANCE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface TransactionItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  items: TransactionItem[];
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  storeroom: string; // Storeroom ID
  approvalStage?: string; // Current approval stage ID
}

export interface ApprovalStage {
  id: string;
  name: string;
  requiredRoles: UserRole[];
  minimumApprovals: number;
}

export interface ApprovalWorkflow {
  id: string;
  transactionType: TransactionType;
  stages: ApprovalStage[];
}
