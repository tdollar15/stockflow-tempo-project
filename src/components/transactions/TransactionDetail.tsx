"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeftRight,
  PackageCheck,
  PackagePlus,
  Truck,
  History,
  FileText,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TransactionItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_price?: number;
  direction?: string;
  purpose?: string;
  item?: {
    id: string;
    name: string;
    unit: string;
  };
}

interface ApprovalStep {
  id: string;
  approver_role: string;
  sequence_number: number;
  status: "pending" | "approved" | "rejected";
  approver_id?: string;
  approved_at?: string;
  comments?: string;
  approver?: {
    id: string;
    name: string;
    role: string;
  };
}

interface Transaction {
  id: string;
  transaction_number: string;
  type: "receipt" | "issuance" | "transfer" | "swap";
  status: "pending" | "approved" | "rejected";
  source_storeroom_id?: string;
  dest_storeroom_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  reference_number?: string;
  supplier_name?: string;
  source_storeroom?: { id: string; name: string; location: string };
  dest_storeroom?: { id: string; name: string; location: string };
  transaction_items?: TransactionItem[];
  approval_workflows?: ApprovalStep[];
  documents?: { id: string; name: string; file_path: string }[];
}

interface TransactionDetailProps {
  id?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "receipt":
      return <PackagePlus className="h-5 w-5" />;
    case "issuance":
      return <PackageCheck className="h-5 w-5" />;
    case "transfer":
      return <ArrowLeftRight className="h-5 w-5" />;
    case "swap":
      return <Truck className="h-5 w-5" />;
    default:
      return <ClipboardList className="h-5 w-5" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const TransactionDetail = ({ id }: TransactionDetailProps) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTransactionDetails(id);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchTransactionDetails = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          source_storeroom:storerooms!transactions_source_storeroom_id_fkey(*),
          dest_storeroom:storerooms!transactions_dest_storeroom_id_fkey(*),
          transaction_items(*, item:items(*)),
          approval_workflows(*),
          documents(*)
        `,
        )
        .eq("id", transactionId)
        .single();

      if (error) throw error;
      setTransaction(data);
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Transaction not found. Please select a valid transaction."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formattedDate = new Date(transaction.created_at).toLocaleString();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-100">
            {getTransactionIcon(transaction.type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Transaction {transaction.transaction_number}
              <Badge className={`ml-2 ${getStatusColor(transaction.status)}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(transaction.status)}
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </span>
              </Badge>
            </h1>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          {transaction.status === "pending" && (
            <Button variant="destructive" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
              <CardDescription>
                Details about this {transaction.type} transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Transaction Type
                  </p>
                  <p className="text-gray-900 capitalize">{transaction.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created By
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {transaction.created_by.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{transaction.created_by}</span>
                  </div>
                </div>
                {transaction.source_storeroom && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Source Location
                    </p>
                    <p className="text-gray-900">
                      {transaction.source_storeroom.name}
                    </p>
                  </div>
                )}
                {transaction.dest_storeroom && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Destination Location
                    </p>
                    <p className="text-gray-900">
                      {transaction.dest_storeroom.name}
                    </p>
                  </div>
                )}
                {transaction.supplier_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Supplier
                    </p>
                    <p className="text-gray-900">{transaction.supplier_name}</p>
                  </div>
                )}
                {transaction.reference_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Reference Number
                    </p>
                    <p className="text-gray-900">
                      {transaction.reference_number}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        {transaction.type === "receipt" && (
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                        )}
                        {transaction.type === "swap" && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Direction
                          </th>
                        )}
                        {transaction.type === "issuance" && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purpose
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transaction.transaction_items &&
                        transaction.transaction_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.item?.name || "Unknown Item"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.item?.unit || "pcs"}
                            </td>
                            {transaction.type === "receipt" && (
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                {item.unit_price
                                  ? `$${item.unit_price.toFixed(2)}`
                                  : "-"}
                              </td>
                            )}
                            {transaction.type === "swap" && (
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <Badge
                                  variant={
                                    item.direction === "outgoing"
                                      ? "destructive"
                                      : "default"
                                  }
                                >
                                  {item.direction || "-"}
                                </Badge>
                              </td>
                            )}
                            {transaction.type === "issuance" && (
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {item.purpose || "-"}
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {transaction.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {transaction.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Current status of the approval process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {transaction.approval_workflows &&
                transaction.approval_workflows.length > 0 ? (
                  transaction.approval_workflows.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index <
                        (transaction.approval_workflows?.length || 0) - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                      )}
                      <div className="flex items-start gap-4 relative z-10">
                        <div
                          className={`rounded-full p-2 ${step.status === "approved" ? "bg-green-100" : step.status === "rejected" ? "bg-red-100" : "bg-gray-100"}`}
                        >
                          {step.status === "approved" ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : step.status === "rejected" ? (
                            <XCircle className="h-6 w-6 text-red-600" />
                          ) : (
                            <Clock className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {step.approver_role} Approval
                              </h3>
                              {step.approver && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback>
                                      {step.approver.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-600">
                                    {step.approver.name}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge className={`${getStatusColor(step.status)}`}>
                              {step.status.charAt(0).toUpperCase() +
                                step.status.slice(1)}
                            </Badge>
                          </div>

                          {step.approved_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(step.approved_at).toLocaleString()}
                            </p>
                          )}

                          {step.comments && (
                            <div className="mt-2 bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                              <p className="flex items-start gap-1">
                                <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500" />
                                {step.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No approval workflow found</p>
                  </div>
                )}

                {transaction.status === "pending" && (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="w-full">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>
                Documents attached to this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transaction.documents && transaction.documents.length > 0 ? (
                <div className="space-y-3">
                  {transaction.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No documents attached to this transaction
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Timeline of all actions on this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <History className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Transaction created</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Created by {transaction.created_by}
                    </p>
                  </div>
                </div>

                {transaction.approval_workflows &&
                  transaction.approval_workflows
                    .filter((step) => step.status !== "pending")
                    .map((step) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-full ${step.status === "approved" ? "bg-green-100" : "bg-red-100"} flex items-center justify-center`}
                          >
                            {step.status === "approved" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {step.status === "approved"
                              ? "Approved"
                              : "Rejected"}{" "}
                            by {step.approver_role}
                          </p>
                          {step.approved_at && (
                            <p className="text-xs text-gray-500">
                              {new Date(step.approved_at).toLocaleString()}
                            </p>
                          )}
                          {step.approver && (
                            <p className="text-sm text-gray-700 mt-1">
                              {step.approver.name}
                            </p>
                          )}
                          {step.comments && (
                            <p className="text-sm text-gray-600 mt-1 italic">
                              "{step.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {transaction.status === "rejected" && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Transaction Rejected</AlertTitle>
          <AlertDescription>
            This transaction has been rejected. Please review the comments and
            make necessary changes before resubmitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TransactionDetail;
