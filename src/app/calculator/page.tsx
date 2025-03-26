import React from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CalculatorPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Calculator className="mr-2 h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Inventory Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reorder Point Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="avg-daily-usage">Average Daily Usage</Label>
                <Input
                  id="avg-daily-usage"
                  type="number"
                  placeholder="Units per day"
                />
              </div>
              <div>
                <Label htmlFor="lead-time">Lead Time (days)</Label>
                <Input id="lead-time" type="number" placeholder="Days" />
              </div>
              <div>
                <Label htmlFor="safety-stock">Safety Stock</Label>
                <Input id="safety-stock" type="number" placeholder="Units" />
              </div>
              <div>
                <Button className="w-full">Calculate Reorder Point</Button>
              </div>
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="font-medium">
                  Reorder Point: <span className="text-blue-600">0 units</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Economic Order Quantity (EOQ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="annual-demand">Annual Demand</Label>
                <Input
                  id="annual-demand"
                  type="number"
                  placeholder="Units per year"
                />
              </div>
              <div>
                <Label htmlFor="order-cost">Order Cost ($)</Label>
                <Input
                  id="order-cost"
                  type="number"
                  placeholder="Cost per order"
                />
              </div>
              <div>
                <Label htmlFor="holding-cost">
                  Annual Holding Cost per Unit ($)
                </Label>
                <Input
                  id="holding-cost"
                  type="number"
                  placeholder="Cost per unit per year"
                />
              </div>
              <div>
                <Button className="w-full">Calculate EOQ</Button>
              </div>
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="font-medium">
                  Economic Order Quantity:{" "}
                  <span className="text-blue-600">0 units</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
