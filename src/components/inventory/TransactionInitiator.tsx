"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Send,
} from "lucide-react";

// Mock data - will be replaced with actual data from Supabase
const items = [
  { id: "1", name: "Laptop" },
  { id: "2", name: "Monitor" },
  { id: "3", name: "Keyboard" },
  { id: "4", name: "Mouse" },
];

const storerooms = [
  { id: "1", name: "Main Warehouse" },
  { id: "2", name: "IT Department" },
  { id: "3", name: "Office Supplies" },
  { id: "4", name: "Electronics" },
];

// Form schema
const formSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  sourceStoreroomId: z.string().optional(),
  destStoreroomId: z.string().optional(),
  justification: z.string().optional(),
});

export const TransactionInitiator = () => {
  const [transactionType, setTransactionType] = useState("receipt");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      sourceStoreroomId: "",
      destStoreroomId: "",
      justification: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ ...values, transactionType });
    // Here we would submit the transaction to the backend
    // and handle the response
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-950 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="receipt"
          onValueChange={(value) => setTransactionType(value)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="receipt" className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Receipt
            </TabsTrigger>
            <TabsTrigger value="issuance" className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Issuance
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Swap
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Common fields for all transaction types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Receipt-specific fields */}
              <TabsContent value="receipt">
                <FormField
                  control={form.control}
                  name="destStoreroomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Storeroom</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination storeroom" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storerooms.map((storeroom) => (
                            <SelectItem key={storeroom.id} value={storeroom.id}>
                              {storeroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The storeroom where the items will be received
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Issuance-specific fields */}
              <TabsContent value="issuance">
                <FormField
                  control={form.control}
                  name="sourceStoreroomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Storeroom</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source storeroom" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storerooms.map((storeroom) => (
                            <SelectItem key={storeroom.id} value={storeroom.id}>
                              {storeroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The storeroom from which items will be issued
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Transfer-specific fields */}
              <TabsContent value="transfer">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sourceStoreroomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Storeroom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source storeroom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storerooms.map((storeroom) => (
                              <SelectItem
                                key={storeroom.id}
                                value={storeroom.id}
                              >
                                {storeroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destStoreroomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Storeroom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination storeroom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storerooms.map((storeroom) => (
                              <SelectItem
                                key={storeroom.id}
                                value={storeroom.id}
                              >
                                {storeroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Swap-specific fields */}
              <TabsContent value="swap">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sourceStoreroomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Storeroom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source storeroom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storerooms.map((storeroom) => (
                              <SelectItem
                                key={storeroom.id}
                                value={storeroom.id}
                              >
                                {storeroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destStoreroomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Storeroom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination storeroom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storerooms.map((storeroom) => (
                              <SelectItem
                                key={storeroom.id}
                                value={storeroom.id}
                              >
                                {storeroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Justification</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Provide reason for swap"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain why this swap is necessary
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          className="w-full md:w-auto transition-all duration-200 hover:scale-105"
        >
          Submit Transaction
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionInitiator;
