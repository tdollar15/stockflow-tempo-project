import React from "react";
import { Store, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StoreroomPage() {
  // Mock data for storerooms
  const storerooms = [
    {
      id: 1,
      name: "Main Warehouse",
      location: "Building A, Floor 1",
      manager: "John Smith",
      itemCount: 1245,
      status: "Active",
    },
    {
      id: 2,
      name: "Electronics Storage",
      location: "Building B, Floor 2",
      manager: "Sarah Johnson",
      itemCount: 567,
      status: "Active",
    },
    {
      id: 3,
      name: "Office Supplies",
      location: "Building A, Floor 3",
      manager: "Michael Brown",
      itemCount: 328,
      status: "Active",
    },
    {
      id: 4,
      name: "Seasonal Storage",
      location: "Building C, Basement",
      manager: "Emily Davis",
      itemCount: 189,
      status: "Inactive",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Store className="mr-2 h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Storerooms</h1>
        </div>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Storeroom
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storerooms.map((storeroom) => (
          <Card key={storeroom.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{storeroom.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    storeroom.status === "Active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {storeroom.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>{storeroom.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p>{storeroom.manager}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium">
                    {storeroom.itemCount.toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    View Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
