"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ActionCards from "@/components/dashboard/ActionCards";
import InventoryStatusChart from "@/components/dashboard/InventoryStatusChart";
import PendingApprovals from "@/components/dashboard/PendingApprovals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, AlertCircle, Package } from "lucide-react";

interface DashboardPageProps {
  userRole?: "admin" | "supervisor" | "storeman" | "clerk" | "supplier";
  userName?: string;
  userAvatar?: string;
}

export default function DashboardPage({
  userRole = "admin",
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for summary cards
  const summaryData = {
    totalItems: 1248,
    lowStockItems: 32,
    pendingTransactions: 15,
    recentActivity: 87,
  };

  const handleApproveTransaction = (id: string) => {
    console.log(`Approving transaction ${id}`);
    // Implement approval logic here
  };

  const handleRejectTransaction = (id: string) => {
    console.log(`Rejecting transaction ${id}`);
    // Implement rejection logic here
  };

  const handleViewTransactionDetails = (id: string) => {
    console.log(`Viewing details for transaction ${id}`);
    // Navigate to transaction details page
  };

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName}
      userAvatar={userAvatar}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Welcome back, {userName}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inventory
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Items across all storerooms
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">
                Items requiring attention
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Transactions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.pendingTransactions}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.recentActivity}
              </div>
              <p className="text-xs text-muted-foreground">
                Actions in last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <ActionCards userRole={userRole} />

        {/* Tabs for different dashboard views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InventoryStatusChart />
              <PendingApprovals
                onApprove={handleApproveTransaction}
                onReject={handleRejectTransaction}
                onViewDetails={handleViewTransactionDetails}
              />
            </div>
          </TabsContent>
          <TabsContent value="approvals" className="space-y-4 mt-4">
            <PendingApprovals
              onApprove={handleApproveTransaction}
              onReject={handleRejectTransaction}
              onViewDetails={handleViewTransactionDetails}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
