import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TransactionService, Transaction } from "@/services/TransactionService";
import { TransactionType } from "@/components/transactions/TransactionWorkflow";
import { UserRole } from "@/components/users/UserManagementForm";

// Explicitly define transaction stages to match TransactionService
const TransactionStage = {
  Draft: 'Draft',
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected'
} as const;

type TransactionStageType = typeof TransactionStage[keyof typeof TransactionStage];

interface PendingApprovalsProps {
  transactions?: Transaction[];
  userRole: UserRole;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

const getTransactionTypeColor = (type: TransactionType) => {
  switch (type) {
    case TransactionType.Issuance: return "bg-blue-500";
    case TransactionType.Receipt: return "bg-green-500";
    case TransactionType.Transfer: return "bg-yellow-500";
    case TransactionType.Swap: return "bg-purple-500";
    default: return "bg-gray-500";
  }
};

const getStatusIcon = (stage: TransactionStageType) => {
  switch (stage) {
    case TransactionStage.Draft: return <Clock className="text-yellow-500" />;
    case TransactionStage.Pending: return <AlertCircle className="text-blue-500" />;
    case TransactionStage.Approved: return <CheckCircle className="text-green-500" />;
    case TransactionStage.Rejected: return <XCircle className="text-red-500" />;
    default: return <Clock className="text-gray-500" />;
  }
};

const PendingApprovals = ({
  transactions: initialTransactions,
  userRole,
  onApprove = () => {},
  onReject = () => {},
  onViewDetails = () => {},
  isLoading: initialLoading = false,
}: PendingApprovalsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    // If transactions are provided as props, use them
    if (initialTransactions) {
      setTransactions(initialTransactions);
      return;
    }

    // Fetch transactions based on user role
    const fetchTransactions = () => {
      let filteredTransactions: Transaction[] = [];
      
      switch (userRole) {
        case UserRole.Supervisor:
          // Fetch transactions that need supervisor approval
          filteredTransactions = TransactionService.getTransactions({
            stage: TransactionStage.Draft as TransactionStageType
          });
          break;
        case UserRole.Admin:
          // Fetch all pending transactions
          filteredTransactions = TransactionService.getTransactions({
            stage: TransactionStage.Pending as TransactionStageType
          });
          break;
        case UserRole.Storeman:
          // Fetch transactions relevant to storeman
          filteredTransactions = TransactionService.getTransactions({
            stage: TransactionStage.Draft as TransactionStageType
          }).filter(t => 
            t.type === TransactionType.Transfer || 
            t.type === TransactionType.Swap
          );
          break;
        default:
          // Other roles might have limited or no access
          filteredTransactions = [];
      }

      setTransactions(filteredTransactions);
      setIsLoading(false);
    };

    fetchTransactions();
  }, [userRole, initialTransactions]);

  const handleApprove = (transactionId: string) => {
    // Implement stage progression based on user role
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    let newStage: TransactionStageType;
    switch (userRole) {
      case UserRole.Supervisor:
        newStage = TransactionStage.Pending;
        break;
      case UserRole.Admin:
        newStage = TransactionStage.Approved;
        break;
      default:
        return;
    }

    const updatedTransaction = TransactionService.updateTransactionStage(
      transactionId, 
      newStage, 
      userRole
    );

    if (updatedTransaction) {
      setTransactions(transactions.filter(t => t.id !== transactionId));
      onApprove(transactionId);
    }
  };

  const handleReject = (transactionId: string) => {
    const updatedTransaction = TransactionService.updateTransactionStage(
      transactionId, 
      TransactionStage.Rejected as TransactionStageType, 
      userRole
    );

    if (updatedTransaction) {
      setTransactions(transactions.filter(t => t.id !== transactionId));
      onReject(transactionId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <Badge 
                    className={`${getTransactionTypeColor(transaction.type)} text-white`}
                  >
                    {transaction.type}
                  </Badge>
                  <div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.stage as TransactionStageType)}
                      <span>{transaction.stage}</span>
                    </div>
                    <p>
                      {transaction.items.map(item => 
                        `${item.quantity} x ${item.itemId}`
                      ).join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Storeroom: {transaction.storeroom}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onViewDetails(transaction.id)}
                  >
                    View Details
                  </Button>
                  {(userRole === UserRole.Supervisor || userRole === UserRole.Admin) && (
                    <>
                      <Button 
                        variant="default" 
                        onClick={() => handleApprove(transaction.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReject(transaction.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
