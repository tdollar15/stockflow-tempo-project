"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, PackagePlus, Send, Repeat, RefreshCw } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

type TransactionType = "receipt" | "issuance" | "transfer" | "swap";

interface TransactionFormValues {
  type: TransactionType;
  itemId: string;
  quantity: number;
  sourceStoreroomId?: string;
  destStoreroomId?: string;
  justification?: string;
}

const defaultItems = [
  { id: "item1", name: "Laptop Dell XPS 15" },
  { id: "item2", name: 'Monitor 27" 4K' },
  { id: "item3", name: "Wireless Keyboard" },
  { id: "item4", name: "Wireless Mouse" },
  { id: "item5", name: "USB-C Dock" },
];

const defaultStorerooms = [
  { id: "store1", name: "Main Warehouse" },
  { id: "store2", name: "IT Department" },
  { id: "store3", name: "Engineering" },
  { id: "store4", name: "Sales Office" },
];

interface TransactionInitiatorProps {
  items?: typeof defaultItems;
  storerooms?: typeof defaultStorerooms;
  onSubmit?: (values: TransactionFormValues) => void;
}

const TransactionInitiator = ({
  items = defaultItems,
  storerooms = defaultStorerooms,
  onSubmit = (values) => console.log("Transaction submitted:", values),
}: TransactionInitiatorProps) => {
  const [activeTab, setActiveTab] = useState<TransactionType>("receipt");

  const form = useForm<TransactionFormValues>({
    defaultValues: {
      type: activeTab,
      itemId: "",
      quantity: 1,
      sourceStoreroomId: "",
      destStoreroomId: "",
      justification: "",
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as TransactionType);
    form.setValue("type", value as TransactionType);
  };

  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit({
      ...values,
      type: activeTab,
    });
    form.reset();
  };

  return (
    <Card className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Initiate Transaction
        </CardTitle>
        <CardDescription>
          Create a new inventory transaction based on your requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="receipt"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="receipt" className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4" />
              Receipt
            </TabsTrigger>
            <TabsTrigger value="issuance" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Issuance
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
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
