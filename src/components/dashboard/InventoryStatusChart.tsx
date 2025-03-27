"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface InventoryStatusChartProps {
  inventoryData?: any[];
  storeroomData?: any[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const COLORS = ["#4A90E2", "#82ca9d", "#ffc658", "#ff8042", "#8884d8"];
const STATUS_COLORS = {
  low: "#ef4444",
  medium: "#f59e0b",
  high: "#10b981",
};

const InventoryStatusChart = ({
  inventoryData = [],
  storeroomData = [],
  isLoading = false,
  title = "Inventory Status",
  description = "Current inventory levels across all storerooms",
}: InventoryStatusChartProps) => {
  const [activeTab, setActiveTab] = useState("bar");
  const [selectedStoreroom, setSelectedStoreroom] = useState<string>("all");

  // Process the real data from Supabase
  const chartData = useMemo(() => {
    if (!inventoryData.length || !storeroomData.length) {
      return [];
    }

    // Group inventory by storeroom and count status
    const storeroomInventory = storeroomData.map((storeroom) => {
      const items = inventoryData.filter(
        (item) => item.storeroom_id === storeroom.id,
      );

      const inStock = items.filter(
        (item) => item.quantity > (item.min_quantity || 0),
      ).length;
      const lowStock = items.filter(
        (item) =>
          item.quantity > 0 && item.quantity <= (item.min_quantity || 0),
      ).length;
      const outOfStock = items.filter((item) => item.quantity <= 0).length;

      return {
        name: storeroom.name,
        inStock,
        lowStock,
        outOfStock,
      };
    });

    return storeroomInventory;
  }, [inventoryData, storeroomData]);

  // Get unique storerooms for filter
  const storerooms = useMemo(() => {
    return ["all", ...storeroomData.map((item) => item.name)];
  }, [storeroomData]);

  // Filter data based on selected storeroom
  const filteredData = useMemo(() => {
    if (selectedStoreroom === "all") {
      return chartData;
    }
    return chartData.filter((item) => item.name === selectedStoreroom);
  }, [chartData, selectedStoreroom]);

  // Prepare data for status pie chart
  const statusData = useMemo(() => {
    if (!inventoryData.length) return [];

    // Filter inventory by selected storeroom if needed
    let filteredInventory = inventoryData;
    if (selectedStoreroom !== "all") {
      const storeroomId = storeroomData.find(
        (s) => s.name === selectedStoreroom,
      )?.id;
      if (storeroomId) {
        filteredInventory = inventoryData.filter(
          (item) => item.storeroom_id === storeroomId,
        );
      }
    }

    return [
      {
        name: "Low Stock",
        value: filteredInventory.filter(
          (item) =>
            item.quantity > 0 && item.quantity <= (item.min_quantity || 0),
        ).length,
      },
      {
        name: "Medium Stock",
        value: filteredInventory.filter(
          (item) =>
            item.quantity > (item.min_quantity || 0) &&
            item.quantity < (item.max_quantity || Infinity),
        ).length,
      },
      {
        name: "High Stock",
        value: filteredInventory.filter(
          (item) => item.quantity >= (item.max_quantity || Infinity),
        ).length,
      },
    ];
  }, [inventoryData, storeroomData, selectedStoreroom]);

  // Prepare data for storeroom distribution
  const storeroomDistribution = useMemo(() => {
    return storeroomData.map((room) => ({
      name: room.name,
      value: inventoryData.filter((item) => item.storeroom_id === room.id)
        .length,
    }));
  }, [inventoryData, storeroomData]);

  if (isLoading) {
    return (
      <Card
        className={cn(
          "w-full h-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full h-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <Select value={selectedStoreroom} onValueChange={setSelectedStoreroom}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select storeroom" />
          </SelectTrigger>
          <SelectContent>
            {storerooms.map((room) => (
              <SelectItem key={room} value={room}>
                {room === "all" ? "All Storerooms" : room}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bar" className="p-4 pt-2">
            <div className="h-[300px] w-full">
              {filteredData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="inStock"
                      name="In Stock"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="lowStock"
                      name="Low Stock"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="outOfStock"
                      name="Out of Stock"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No inventory data available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="status" className="p-4 pt-2">
            <div className="h-[300px] w-full">
              {statusData.length > 0 &&
              statusData.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      animationDuration={1500}
                    >
                      <Cell key="low" fill={STATUS_COLORS.low} />
                      <Cell key="medium" fill={STATUS_COLORS.medium} />
                      <Cell key="high" fill={STATUS_COLORS.high} />
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} items`, "Count"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No status data available</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm capitalize">{status} Stock</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="p-4 pt-2">
            <div className="h-[300px] w-full">
              {storeroomDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={storeroomDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      animationDuration={1500}
                    >
                      {storeroomDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} items`, "Count"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    No distribution data available
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;
