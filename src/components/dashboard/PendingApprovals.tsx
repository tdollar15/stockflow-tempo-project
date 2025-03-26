"use client";

import React from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface Transaction {
  id: string;
  type: "receipt" | "issuance" | "transfer" | "swap";
  itemName: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  createdBy: {
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: string;
  sourceStoreroom?: string;
  destStoreroom?: string;
}

interface PendingApprovalsProps {
  transactions?: Transaction[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const PendingApprovals = ({
  transactions = [
    {
      id: "tx-001",
      type: "receipt",
      itemName: "Laptop Chargers",
      quantity: 25,
      status: "pending",
      createdBy: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        initials: "JD",
      },
      createdAt: "2023-06-15T09:30:00Z",
      destStoreroom: "Main Warehouse",
    },
    {
      id: "tx-002",
      type: "transfer",
      itemName: "Office Chairs",
      quantity: 10,
      status: "pending",
      createdBy: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        initials: "JS",
      },
      createdAt: "2023-06-14T14:45:00Z",
      sourceStoreroom: "Main Warehouse",
      destStoreroom: "Office Building B",
    },
    {
      id: "tx-003",
      type: "issuance",
      itemName: "Printer Ink Cartridges",
      quantity: 15,
      status: "pending",
      createdBy: {
        name: "Robert Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
        initials: "RJ",
      },
      createdAt: "2023-06-14T11:20:00Z",
      sourceStoreroom: "Supply Closet",
    },
  ],
  onApprove = () => {},
  onReject = () => {},
  onViewDetails = () => {},
}: PendingApprovalsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "receipt":
        return "bg-green-100 text-green-800";
      case "issuance":
        return "bg-blue-100 text-blue-800";
      case "transfer":
        return "bg-purple-100 text-purple-800";
      case "swap":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Clock className="mr-2 h-5 w-5 text-yellow-500" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 divide-opacity-20">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>No pending approvals at this time.</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-gray-50 hover:bg-opacity-10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      {transaction.createdBy.avatar ? (
                        <AvatarImage
                          src={transaction.createdBy.avatar}
                          alt={transaction.createdBy.name}
                        />
                      ) : (
                        <AvatarFallback>
                          {transaction.createdBy.initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {transaction.createdBy.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${getTransactionTypeColor(transaction.type)} border-0`}
                        >
                          {transaction.type.charAt(0).toUpperCase() +
                            transaction.type.slice(1)}
                        </Badge>
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 text-xs text-gray-500">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="font-medium">
                          {transaction.quantity}x
                        </span>{" "}
                        {transaction.itemName}
                      </p>
                      {(transaction.sourceStoreroom ||
                        transaction.destStoreroom) && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          {transaction.sourceStoreroom && (
                            <span>{transaction.sourceStoreroom}</span>
                          )}
                          {transaction.sourceStoreroom &&
                            transaction.destStoreroom && (
                              <ArrowRight className="h-3 w-3 mx-1" />
                            )}
                          {transaction.destStoreroom && (
                            <span>{transaction.destStoreroom}</span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => onApprove(transaction.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      onClick={() => onReject(transaction.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      {transactions.length > 0 && (
        <CardFooter className="justify-center border-t border-gray-200 border-opacity-20 p-4">
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => onViewDetails("all")}
          >
            View All Pending Approvals
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PendingApprovals;
