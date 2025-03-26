import React from "react";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="mr-2 h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover</CardTitle>
            <CardDescription>Monthly inventory turnover rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
            <CardDescription>Current stock levels by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Transaction volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
