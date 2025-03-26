"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  Filter,
  MoreHorizontal,
  Eye,
  FileEdit,
  Trash2,
  Search,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "receipt" | "issuance" | "transfer" | "swap";
  itemName: string;
  quantity: number;
  sourceStoreroom?: string;
  destStoreroom?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdAt: string;
}

interface TransactionsListProps {
  transactions?: Transaction[];
}

const TransactionsList = ({
  transactions = [
    {
      id: "TX-001",
      type: "receipt",
      itemName: "Laptop Dell XPS 13",
      quantity: 10,
      destStoreroom: "Main Warehouse",
      status: "approved",
      createdBy: "John Doe",
      createdAt: "2023-06-15T10:30:00Z",
    },
    {
      id: "TX-002",
      type: "issuance",
      itemName: "Office Chair",
      quantity: 5,
      sourceStoreroom: "Main Warehouse",
      status: "pending",
      createdBy: "Jane Smith",
      createdAt: "2023-06-16T14:45:00Z",
    },
    {
      id: "TX-003",
      type: "transfer",
      itemName: "Printer Cartridges",
      quantity: 20,
      sourceStoreroom: "Main Warehouse",
      destStoreroom: "Office Supplies",
      status: "pending",
      createdBy: "Mike Johnson",
      createdAt: "2023-06-17T09:15:00Z",
    },
    {
      id: "TX-004",
      type: "swap",
      itemName: 'Monitor 24"',
      quantity: 3,
      sourceStoreroom: "IT Department",
      destStoreroom: "Marketing Department",
      status: "rejected",
      createdBy: "Sarah Williams",
      createdAt: "2023-06-18T11:20:00Z",
    },
    {
      id: "TX-005",
      type: "receipt",
      itemName: "Wireless Keyboards",
      quantity: 15,
      destStoreroom: "IT Department",
      status: "approved",
      createdBy: "Robert Brown",
      createdAt: "2023-06-19T16:10:00Z",
    },
  ],
}: TransactionsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get badge color based on transaction type
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "receipt":
        return "default";
      case "issuance":
        return "secondary";
      case "transfer":
        return "outline";
      case "swap":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ? true : transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ? true : transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="w-full p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <Button className="transition-transform hover:scale-105 active:scale-95">
            Create Transaction
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="issuance">Issuance</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-9 w-9">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Type <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Source/Destination</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="transition-all hover:bg-opacity-20 hover:translate-y-[-2px] hover:shadow-md"
                  >
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.itemName}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>
                      {transaction.type === "receipt" &&
                        transaction.destStoreroom}
                      {transaction.type === "issuance" &&
                        transaction.sourceStoreroom}
                      {(transaction.type === "transfer" ||
                        transaction.type === "swap") &&
                        `${transaction.sourceStoreroom} → ${transaction.destStoreroom}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{transaction.createdBy}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {transaction.status === "pending" && (
                            <>
                              <DropdownMenuItem className="cursor-pointer">
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
