"use client";

import React, { useState } from "react";
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

interface InventoryItem {
  name: string;
  quantity: number;
  storeroom: string;
  status: "low" | "medium" | "high";
}

interface InventoryStatusChartProps {
  data?: InventoryItem[];
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
  data = [
    {
      name: "Item A",
      quantity: 120,
      storeroom: "Main Warehouse",
      status: "high",
    },
    {
      name: "Item B",
      quantity: 80,
      storeroom: "Main Warehouse",
      status: "medium",
    },
    {
      name: "Item C",
      quantity: 40,
      storeroom: "Main Warehouse",
      status: "low",
    },
    {
      name: "Item D",
      quantity: 150,
      storeroom: "Secondary Storage",
      status: "high",
    },
    {
      name: "Item E",
      quantity: 60,
      storeroom: "Secondary Storage",
      status: "medium",
    },
    {
      name: "Item F",
      quantity: 30,
      storeroom: "Secondary Storage",
      status: "low",
    },
    {
      name: "Item G",
      quantity: 90,
      storeroom: "Electronics",
      status: "medium",
    },
    { name: "Item H", quantity: 20, storeroom: "Electronics", status: "low" },
    { name: "Item I", quantity: 110, storeroom: "Tools", status: "high" },
    { name: "Item J", quantity: 50, storeroom: "Tools", status: "medium" },
  ],
  title = "Inventory Status",
  description = "Current inventory levels across all storerooms",
}: InventoryStatusChartProps) => {
  const [activeTab, setActiveTab] = useState("bar");
  const [selectedStoreroom, setSelectedStoreroom] = useState<string>("all");

  // Get unique storerooms for filter
  const storerooms = ["all", ...new Set(data.map((item) => item.storeroom))];

  // Filter data based on selected storeroom
  const filteredData =
    selectedStoreroom === "all"
      ? data
      : data.filter((item) => item.storeroom === selectedStoreroom);

  // Prepare data for status pie chart
  const statusData = [
    {
      name: "Low Stock",
      value: filteredData.filter((item) => item.status === "low").length,
    },
    {
      name: "Medium Stock",
      value: filteredData.filter((item) => item.status === "medium").length,
    },
    {
      name: "High Stock",
      value: filteredData.filter((item) => item.status === "high").length,
    },
  ];

  // Prepare data for storeroom distribution
  const storeroomData = storerooms
    .filter((room) => room !== "all")
    .map((room) => ({
      name: room,
      value: data.filter((item) => item.storeroom === room).length,
    }));

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
                    dataKey="quantity"
                    fill="#4A90E2"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="status" className="p-4 pt-2">
            <div className="h-[300px] w-full">
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storeroomData}
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
                    {storeroomData.map((entry, index) => (
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;
