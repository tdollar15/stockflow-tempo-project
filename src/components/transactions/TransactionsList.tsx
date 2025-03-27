"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: string;
  transaction_number: string;
  type: "receipt" | "issuance" | "transfer" | "swap";
  status: "pending" | "approved" | "rejected";
  source_storeroom_id?: string;
  dest_storeroom_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  reference_number?: string;
  supplier_name?: string;
  source_storeroom?: { name: string };
  dest_storeroom?: { name: string };
  transaction_items?: {
    id: string;
    item_id: string;
    quantity: number;
    unit_price?: number;
    direction?: string;
    purpose?: string;
    item?: { name: string };
  }[];
}

interface TransactionsListProps {
  onViewDetail?: (transactionId: string) => void;
}

const TransactionsList = ({ onViewDetail }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          source_storeroom:storerooms!transactions_source_storeroom_id_fkey(name),
          dest_storeroom:storerooms!transactions_dest_storeroom_id_fkey(name),
          transaction_items(*, item:items(name))
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Get the main item name for display
  const getMainItemName = (transaction: Transaction) => {
    if (
      !transaction.transaction_items ||
      transaction.transaction_items.length === 0
    ) {
      return "No items";
    }

    const firstItem = transaction.transaction_items[0];
    const itemName = firstItem.item?.name || "Unknown item";

    if (transaction.transaction_items.length > 1) {
      return `${itemName} + ${transaction.transaction_items.length - 1} more items`;
    }

    return itemName;
  };

  // Get total quantity for display
  const getTotalQuantity = (transaction: Transaction) => {
    if (
      !transaction.transaction_items ||
      transaction.transaction_items.length === 0
    ) {
      return 0;
    }

    return transaction.transaction_items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
  };

  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const mainItemName = getMainItemName(transaction);

    const matchesSearch =
      transaction.transaction_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      mainItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.created_by.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ? true : transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ? true : transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetail = (transactionId: string) => {
    if (onViewDetail) {
      onViewDetail(transactionId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-md border border-red-200 border-opacity-20 shadow-lg">
        <div className="text-red-500 text-center">
          <p>Error loading transactions: {error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchTransactions()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 shadow-lg">
      <div className="flex flex-col space-y-4">
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

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => fetchTransactions()}
            >
              <Filter className="h-4 w-4" />
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
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="group relative cursor-pointer">
                        <span>{getMainItemName(transaction)}</span>
                        {transaction.transaction_items &&
                          transaction.transaction_items.length > 1 && (
                            <div className="absolute left-0 top-full z-10 mt-2 hidden w-64 rounded-md bg-white p-2 shadow-lg group-hover:block">
                              <div className="text-sm font-medium mb-1">
                                Items in this transaction:
                              </div>
                              <ul className="text-xs space-y-1">
                                {transaction.transaction_items.map(
                                  (item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        {item.item?.name || "Unknown item"}
                                      </span>
                                      <span className="font-medium">
                                        Qty: {item.quantity}
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>{getTotalQuantity(transaction)}</TableCell>
                    <TableCell>
                      {transaction.type === "receipt" &&
                        transaction.dest_storeroom?.name}
                      {transaction.type === "issuance" &&
                        transaction.source_storeroom?.name}
                      {(transaction.type === "transfer" ||
                        transaction.type === "swap") &&
                        `${transaction.source_storeroom?.name || "Unknown"} → ${transaction.dest_storeroom?.name || "Unknown"}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.created_by}</TableCell>
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
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewDetail(transaction.id)}
                          >
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
