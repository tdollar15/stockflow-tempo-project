"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryTable from "@/components/inventory/InventoryTable";
import TransactionInitiator from "@/components/inventory/TransactionInitiator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  storeroom: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
}

const InventoryPage = () => {
  const [selectedTab, setSelectedTab] = useState("inventory");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Mock data for inventory overview chart
  const inventoryOverviewData = [
    { storeroom: "Main Warehouse", inStock: 65, lowStock: 15, outOfStock: 5 },
    { storeroom: "North Storeroom", inStock: 40, lowStock: 10, outOfStock: 2 },
    { storeroom: "South Storeroom", inStock: 30, lowStock: 8, outOfStock: 3 },
    { storeroom: "East Storeroom", inStock: 25, lowStock: 12, outOfStock: 8 },
    { storeroom: "West Storeroom", inStock: 35, lowStock: 5, outOfStock: 1 },
  ];

  const handleInitiateTransaction = (item: InventoryItem) => {
    setSelectedItem(item);
    setSelectedTab("transaction");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-white bg-opacity-5 backdrop-blur-sm p-6 rounded-lg border border-gray-200 border-opacity-10 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-gray-500">
              View and manage inventory across all storerooms
            </p>
          </div>

          <Card className="w-full md:w-auto bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-gray-500">Across 5 storerooms</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Overview Chart */}
        <Card className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Stock status across all storerooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryOverviewData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="storeroom" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="inStock" name="In Stock" fill="#4ade80" />
                  <Bar dataKey="lowStock" name="Low Stock" fill="#facc15" />
                  <Bar
                    dataKey="outOfStock"
                    name="Out of Stock"
                    fill="#f87171"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Inventory Table</TabsTrigger>
            <TabsTrigger value="transaction">Transaction Initiator</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <InventoryTable onInitiateTransaction={handleInitiateTransaction} />
          </TabsContent>

          <TabsContent value="transaction" className="mt-6">
            <TransactionInitiator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
