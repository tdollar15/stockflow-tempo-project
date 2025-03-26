import React from "react";
import { Users, Plus, Edit, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  // Mock data for users
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Admin",
      department: "IT",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Supervisor",
      department: "Operations",
      status: "Active",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Storeman",
      department: "Warehouse",
      status: "Active",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Clerk",
      department: "Finance",
      status: "Inactive",
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@example.com",
      role: "Supplier_Driver",
      department: "External",
      status: "Active",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="mr-2 h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <Button className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Search users..." className="md:w-1/3" />
            <div className="flex-1 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-sm">
                All Roles
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                Admin
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                Supervisor
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                Storeman
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                Clerk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Role</th>
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.role}</td>
                    <td className="py-2 px-4">{user.department}</td>
                    <td className="py-2 px-4">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                        >
                          <Edit className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
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
