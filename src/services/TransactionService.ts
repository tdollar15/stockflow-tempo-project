import { TransactionType } from '../components/transactions/TransactionWorkflow';
import { UserRole } from '../components/users/UserManagementForm';

// Ensure TransactionStage is imported or defined consistently
export const TransactionStage = {
  Draft: 'Draft',
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected'
} as const;

type TransactionStageType = typeof TransactionStage[keyof typeof TransactionStage];

// Transaction data model
export interface Transaction {
  id: string;
  type: TransactionType;
  stage: TransactionStageType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  items: TransactionItem[];
  storeroom: string;
  notes?: string;
}

// Transaction item model
export interface TransactionItem {
  itemId: string;
  quantity: number;
  unitPrice?: number;
}

// Mock transaction service
export class TransactionService {
  private static transactions: Transaction[] = [];

  // Create a new transaction
  static createTransaction(
    type: TransactionType, 
    items: TransactionItem[], 
    userRole: UserRole,
    storeroom: string,
    notes?: string
  ): Transaction {
    const transaction: Transaction = {
      id: `trans_${this.transactions.length + 1}`,
      type,
      stage: this.getInitialStage(type, userRole),
      createdBy: 'current_user', // In real app, get from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
      items,
      storeroom,
      notes
    };

    this.transactions.push(transaction);
    return transaction;
  }

  // Update transaction stage
  static updateTransactionStage(
    transactionId: string, 
    newStage: TransactionStageType,
    userRole: UserRole
  ): Transaction | null {
    const transaction = this.transactions.find(t => t.id === transactionId);
    
    if (!transaction || !this.canProgressStage(transaction, newStage, userRole)) {
      return null;
    }

    transaction.stage = newStage;
    transaction.updatedAt = new Date();
    return transaction;
  }

  // Get transactions with filtering
  static getTransactions(
    filters: {
      type?: TransactionType;
      stage?: TransactionStageType;
      storeroom?: string;
    } = {}
  ): Transaction[] {
    return this.transactions.filter(transaction => 
      (!filters.type || transaction.type === filters.type) &&
      (!filters.stage || transaction.stage === filters.stage) &&
      (!filters.storeroom || transaction.storeroom === filters.storeroom)
    );
  }

  // Delete a transaction
  static deleteTransaction(transactionId: string): boolean {
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== transactionId);
    return this.transactions.length < initialLength;
  }

  // Determine initial stage based on transaction type and user role
  private static getInitialStage(
    type: TransactionType, 
    userRole: UserRole
  ): TransactionStageType {
    switch (type) {
      case TransactionType.Issuance:
        return userRole === UserRole.Clerk 
          ? TransactionStage.Draft 
          : TransactionStage.Pending;
      case TransactionType.Receipt:
        return userRole === UserRole.Clerk 
          ? TransactionStage.Draft 
          : TransactionStage.Pending;
      case TransactionType.Transfer:
        return userRole === UserRole.Storeman 
          ? TransactionStage.Draft 
          : TransactionStage.Pending;
      case TransactionType.Swap:
        return userRole === UserRole.Supervisor 
          ? TransactionStage.Draft 
          : TransactionStage.Pending;
      default:
        return TransactionStage.Draft;
    }
  }

  // Validate stage progression
  private static canProgressStage(
    transaction: Transaction, 
    newStage: TransactionStageType,
    userRole: UserRole
  ): boolean {
    // Implement complex stage progression logic
    switch (transaction.type) {
      case TransactionType.Issuance:
        if (userRole === UserRole.Supervisor && 
            transaction.stage === TransactionStage.Draft) {
          return newStage === TransactionStage.Pending;
        }
        break;
      case TransactionType.Receipt:
        if (userRole === UserRole.Supervisor && 
            transaction.stage === TransactionStage.Pending) {
          return newStage === TransactionStage.Approved;
        }
        break;
      // Add more type-specific logic
    }
    return false;
  }
}

// Export a mock data generator for testing
export function generateMockTransactions(count: number = 10): Transaction[] {
  const mockTransactions: Transaction[] = [];
  const types = Object.values(TransactionType);
  const stages = Object.values(TransactionStage);

  for (let i = 0; i < count; i++) {
    mockTransactions.push(
      TransactionService.createTransaction(
        types[Math.floor(Math.random() * types.length)],
        [{ 
          itemId: `item_${i}`, 
          quantity: Math.floor(Math.random() * 100) 
        }],
        UserRole.Storeman,
        `store_${Math.floor(Math.random() * 3)}`
      )
    );
  }

  return mockTransactions;
}
