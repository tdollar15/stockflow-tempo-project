import React from "react";
import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ApprovalsPage() {
  // Mock data for approvals
  const pendingApprovals = [
    {
      id: "TR-001",
      type: "Receipt",
      initiatedBy: "John Doe",
      date: "2023-05-15",
      status: "Pending",
      items: 5,
    },
    {
      id: "TR-002",
      type: "Issuance",
      initiatedBy: "Jane Smith",
      date: "2023-05-16",
      status: "Pending",
      items: 3,
    },
    {
      id: "TR-003",
      type: "Transfer",
      initiatedBy: "Mike Johnson",
      date: "2023-05-17",
      status: "Pending",
      items: 8,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <CheckSquare className="mr-2 h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Approvals</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Initiated By</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Items</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{approval.id}</td>
                    <td className="py-2 px-4">{approval.type}</td>
                    <td className="py-2 px-4">{approval.initiatedBy}</td>
                    <td className="py-2 px-4">{approval.date}</td>
                    <td className="py-2 px-4">{approval.items}</td>
                    <td className="py-2 px-4">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200"
                      >
                        {approval.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-500 border-blue-500 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
