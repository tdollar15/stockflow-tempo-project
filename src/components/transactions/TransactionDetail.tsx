"use client";

import React from "react";
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
} from "lucide-react";

interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ApprovalStep {
  id: string;
  approver: User;
  status: "pending" | "approved" | "rejected";
  timestamp?: string;
  comments?: string;
}

interface TransactionDetailProps {
  id?: string;
  type?: "receipt" | "issuance" | "transfer" | "swap";
  status?: "pending" | "approved" | "rejected";
  createdBy?: User;
  createdAt?: string;
  sourceStoreroom?: string;
  destStoreroom?: string;
  items?: TransactionItem[];
  approvalSteps?: ApprovalStep[];
  documents?: string[];
  notes?: string;
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

const TransactionDetail = ({
  id = "TX-12345",
  type = "transfer",
  status = "pending",
  createdBy = {
    id: "user-1",
    name: "John Doe",
    role: "Clerk",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  createdAt = "2023-06-15T10:30:00Z",
  sourceStoreroom = "Main Warehouse",
  destStoreroom = "East Wing Storage",
  items = [
    { id: "item-1", name: "Laptop Dell XPS 15", quantity: 5, unit: "pcs" },
    { id: "item-2", name: "USB-C Cable", quantity: 10, unit: "pcs" },
    { id: "item-3", name: "Wireless Mouse", quantity: 8, unit: "pcs" },
  ],
  approvalSteps = [
    {
      id: "step-1",
      approver: {
        id: "user-2",
        name: "Jane Smith",
        role: "Storeman",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      status: "approved",
      timestamp: "2023-06-15T11:45:00Z",
      comments: "All items verified and ready for transfer.",
    },
    {
      id: "step-2",
      approver: {
        id: "user-3",
        name: "Robert Johnson",
        role: "Supervisor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
      },
      status: "pending",
    },
  ],
  documents = ["invoice.pdf", "packing-list.pdf"],
  notes = "Please handle with care. These items are needed for the new office setup.",
}: TransactionDetailProps) => {
  const formattedDate = new Date(createdAt).toLocaleString();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-100">
            {getTransactionIcon(type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Transaction {id}
              <Badge className={`ml-2 ${getStatusColor(status)}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
          {status === "pending" && (
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
                Details about this {type} transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Transaction Type
                  </p>
                  <p className="text-gray-900 capitalize">{type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created By
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={createdBy.avatar}
                        alt={createdBy.name}
                      />
                      <AvatarFallback>
                        {createdBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {createdBy.name} ({createdBy.role})
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Source Location
                  </p>
                  <p className="text-gray-900">{sourceStoreroom}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Destination Location
                  </p>
                  <p className="text-gray-900">{destStoreroom}</p>
                </div>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {notes}
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
                {approvalSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index < approvalSteps.length - 1 && (
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
                              {step.approver.role} Approval
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={step.approver.avatar}
                                  alt={step.approver.name}
                                />
                                <AvatarFallback>
                                  {step.approver.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                {step.approver.name}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(step.status)}`}>
                            {step.status.charAt(0).toUpperCase() +
                              step.status.slice(1)}
                          </Badge>
                        </div>

                        {step.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.timestamp).toLocaleString()}
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
                ))}

                {status === "pending" && (
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
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>{doc}</span>
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
                      Created by {createdBy.name}
                    </p>
                  </div>
                </div>

                {approvalSteps
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
                          {step.status === "approved" ? "Approved" : "Rejected"}{" "}
                          by {step.approver.role}
                        </p>
                        {step.timestamp && (
                          <p className="text-xs text-gray-500">
                            {new Date(step.timestamp).toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mt-1">
                          {step.approver.name}
                        </p>
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

      {status === "rejected" && (
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
