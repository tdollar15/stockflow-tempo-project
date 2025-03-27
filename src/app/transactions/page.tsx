"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionsList from "@/components/transactions/TransactionsList";
import TransactionDetail from "@/components/transactions/TransactionDetail";
import TransactionModal from "@/components/transactions/TransactionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("list");

  const handleViewDetail = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    setSelectedTransactionId(null);
    setActiveTab("list");
  };

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Transactions
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and track all inventory transactions across storerooms
              </p>
            </div>
            <Button
              className="transition-transform hover:scale-105 active:scale-95"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="list">All Transactions</TabsTrigger>
              <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
              <TabsTrigger value="detail">Transaction Detail</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <TransactionsList onViewDetail={handleViewDetail} />
            </TabsContent>

            <TabsContent value="pending">
              <div className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Pending Approvals</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Approve All
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      id: "TX-002",
                      type: "issuance",
                      itemName: "Office Chair",
                      quantity: 5,
                      createdBy: "Jane Smith",
                      createdAt: "2023-06-16T14:45:00Z",
                    },
                    {
                      id: "TX-003",
                      type: "transfer",
                      itemName: "Printer Cartridges",
                      quantity: 20,
                      createdBy: "Mike Johnson",
                      createdAt: "2023-06-17T09:15:00Z",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-gray-200 border-opacity-30 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{transaction.id}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Type:</span>{" "}
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Item:</span>{" "}
                        {transaction.itemName}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Quantity:</span>{" "}
                        {transaction.quantity}
                      </p>
                      <p className="text-sm mb-3">
                        <span className="font-medium">Created by:</span>{" "}
                        {transaction.createdBy}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="w-full">
                          Reject
                        </Button>
                        <Button size="sm" className="w-full">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detail">
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={handleBackToList}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to List
                </Button>
              </div>
              <TransactionDetail id={selectedTransactionId || undefined} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  );
}
