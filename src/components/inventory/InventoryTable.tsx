"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
  Printer,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  getInventoryItems,
  getStorerooms,
  getCategories,
} from "@/lib/supabase";
import { format } from "date-fns";

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

interface InventoryTableProps {
  items?: InventoryItem[];
  storerooms?: string[];
  categories?: string[];
  onInitiateTransaction?: (item: InventoryItem) => void;
}

const InventoryTable = ({
  items: initialItems = [],
  storerooms: initialStorerooms = [],
  categories: initialCategories = [],
  onInitiateTransaction = () => {},
}: InventoryTableProps) => {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [storerooms, setStorerooms] = useState<string[]>(initialStorerooms);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreroom, setSelectedStoreroom] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem;
    direction: "asc" | "desc";
  } | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch storerooms
        const storeroomsData = await getStorerooms();
        if (storeroomsData) {
          setStorerooms(storeroomsData.map((s) => s.name));
        }

        // Fetch categories
        const categoriesData = await getCategories();
        if (categoriesData) {
          setCategories(categoriesData.map((c) => c.name));
        }

        // Fetch inventory items
        const inventoryData = await getInventoryItems();
        if (inventoryData) {
          // Transform the data to match our InventoryItem interface
          const transformedItems: InventoryItem[] = inventoryData.map(
            (item) => {
              // Determine status based on quantity and min_quantity
              let status: "In Stock" | "Low Stock" | "Out of Stock" =
                "In Stock";
              if (item.quantity <= 0) {
                status = "Out of Stock";
              } else if (item.quantity <= item.min_quantity) {
                status = "Low Stock";
              }

              return {
                id: item.id,
                name: item.items?.name || "",
                sku: item.items?.sku || "",
                category: item.items?.category_id || "", // This should be the category name in a real implementation
                quantity: item.quantity,
                unit: item.items?.unit || "",
                storeroom: item.storerooms?.name || "",
                status,
                lastUpdated: format(new Date(item.last_updated), "yyyy-MM-dd"),
              };
            },
          );

          setItems(transformedItems);
        }
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to load inventory data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load inventory data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter items based on search term, storeroom, and category
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStoreroom =
      selectedStoreroom === "all" || item.storeroom === selectedStoreroom;
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesStoreroom && matchesCategory;
  });

  // Sort items based on sort config
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  // Request sort for a specific column
  const requestSort = (key: keyof InventoryItem) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle item selection for detail view
  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Out of Stock":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-200 border-opacity-20 shadow-lg">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-200 border-opacity-20 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 bg-white bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-200 border-opacity-20 shadow-lg">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by name or SKU..."
              className="pl-8 bg-white bg-opacity-70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            value={selectedStoreroom}
            onValueChange={setSelectedStoreroom}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white bg-opacity-70">
              <SelectValue placeholder="All Storerooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Storerooms</SelectItem>
              {storerooms.map((storeroom) => (
                <SelectItem key={storeroom} value={storeroom}>
                  {storeroom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white bg-opacity-70">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-1 bg-white bg-opacity-70"
              >
                <Filter className="h-4 w-4" />
                <span>More Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Status: In Stock</DropdownMenuItem>
              <DropdownMenuItem>Status: Low Stock</DropdownMenuItem>
              <DropdownMenuItem>Status: Out of Stock</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Recently Updated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{sortedItems.length} Items</h2>
          <p className="text-sm text-gray-500">
            Showing {sortedItems.length} of {items.length} inventory items
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 bg-white bg-opacity-70"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 bg-white bg-opacity-70"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      {/* Inventory table */}
      <div className="rounded-md border bg-white bg-opacity-70 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[250px] cursor-pointer"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center gap-1">
                  Item Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("sku")}
              >
                <div className="flex items-center gap-1">
                  SKU
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => requestSort("quantity")}
              >
                <div className="flex items-center justify-end gap-1">
                  Quantity
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("storeroom")}
              >
                <div className="flex items-center gap-1">
                  Storeroom
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("lastUpdated")}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleItemSelect(item)}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>{item.storeroom}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn("font-normal", getStatusColor(item.status))}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onInitiateTransaction(item);
                          }}
                        >
                          Initiate Transaction
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemSelect(item);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Edit Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No inventory items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Item detail dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 border-opacity-20">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected inventory item.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white bg-opacity-70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Name
                        </dt>
                        <dd>{selectedItem.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          SKU
                        </dt>
                        <dd>{selectedItem.sku}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Category
                        </dt>
                        <dd>{selectedItem.category}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card className="bg-white bg-opacity-70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Stock Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Quantity
                        </dt>
                        <dd>
                          {selectedItem.quantity} {selectedItem.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Storeroom
                        </dt>
                        <dd>{selectedItem.storeroom}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Status
                        </dt>
                        <dd>
                          <Badge
                            className={cn(
                              "font-normal",
                              getStatusColor(selectedItem.status),
                            )}
                          >
                            {selectedItem.status}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white bg-opacity-70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Last updated on {selectedItem.lastUpdated}
                  </p>
                  <div className="mt-2 text-sm">
                    <p>Recent transactions will be displayed here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
            {selectedItem && (
              <Button
                onClick={() => {
                  onInitiateTransaction(selectedItem);
                  setIsDetailDialogOpen(false);
                }}
              >
                Initiate Transaction
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTable;
