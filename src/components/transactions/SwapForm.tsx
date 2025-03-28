"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Upload, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { TransactionWorkflow, TransactionType, TransactionStage, UserRole } from './TransactionWorkflow';

// Define the schema for swap form validation
const swapFormSchema = z
  .object({
    requestedBy: z.string()
      .min(2, { message: "Requester name must be at least 2 characters" })
      .max(50, { message: "Requester name cannot exceed 50 characters" }),
    sourceStoreroomId: z
      .string()
      .min(1, { message: "Source storeroom is required" }),
    destStoreroomId: z
      .string()
      .min(1, { message: "Destination storeroom is required" })
      .refine(
        (destStoreroomId: string, ctx: { parent: { sourceStoreroomId: string } }) => {
          return destStoreroomId !== ctx.parent.sourceStoreroomId;
        },
        { message: "Source and destination storerooms must be different" }
      ),
    swapDate: z.string()
      .refine(
        (date: string) => {
          const inputDate = new Date(date);
          const today = new Date();
          const maxFutureDate = new Date();
          maxFutureDate.setDate(today.getDate() + 30);
          return inputDate >= today && inputDate <= maxFutureDate;
        },
        { message: "Swap date must be today or within the next 30 days" }
      ),
    outgoingItems: z
      .array(
        z.object({
          itemId: z.string().min(1, { message: "Outgoing item is required" }),
          quantity: z.number()
            .min(1, { message: "Quantity must be at least 1" })
            .max(100, { message: "Quantity cannot exceed 100" }),
          swapReason: z.string()
            .max(200, { message: "Swap reason cannot exceed 200 characters" })
            .optional(),
        })
      )
      .min(1, { message: "At least one outgoing item is required" })
      .max(10, { message: "Maximum of 10 outgoing items allowed" }),
    incomingItems: z
      .array(
        z.object({
          itemId: z.string().min(1, { message: "Incoming item is required" }),
          quantity: z.number()
            .min(1, { message: "Quantity must be at least 1" })
            .max(100, { message: "Quantity cannot exceed 100" }),
        })
      )
      .min(1, { message: "At least one incoming item is required" })
      .max(10, { message: "Maximum of 10 incoming items allowed" }),
    notes: z.string()
      .max(500, { message: "Notes cannot exceed 500 characters" })
      .optional(),
    stage: z.nativeEnum(TransactionStage),
  })
  .refine(
    (data: any) => {
      // Optional: Add a check to ensure total value of outgoing and incoming items is balanced
      return true; // Placeholder for more complex validation
    },
    { message: "Swap items must be of equivalent value" }
  );

type SwapFormValues = z.infer<typeof swapFormSchema>;

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

interface SwapFormProps {
  items?: typeof defaultItems;
  storerooms?: typeof defaultStorerooms;
  onSubmit?: (values: SwapFormValues) => void;
  isLoading?: boolean;
  initialStage?: TransactionStage;
  userRole?: UserRole;
}

const SwapForm = ({
  items = defaultItems,
  storerooms = defaultStorerooms,
  onSubmit = (values: SwapFormValues) => console.log("Swap submitted:", values),
  isLoading = false,
  initialStage = TransactionStage.Draft,
  userRole = UserRole.Supervisor,
}: SwapFormProps) => {
  const [currentStage, setCurrentStage] = useState<TransactionStage>(initialStage);
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      requestedBy: "",
      sourceStoreroomId: "",
      destStoreroomId: "",
      swapDate: new Date().toISOString().split("T")[0],
      outgoingItems: [{ itemId: "", quantity: 1, swapReason: "" }],
      incomingItems: [{ itemId: "", quantity: 1 }],
      notes: "",
      stage: initialStage,
    },
  });

  const {
    fields: outgoingFields,
    append: appendOutgoing,
    remove: removeOutgoing,
  } = form.control._fields.outgoingItems || [];

  const {
    fields: incomingFields,
    append: appendIncoming,
    remove: removeIncoming,
  } = form.control._fields.incomingItems || [];

  const handleSubmit = async (values: SwapFormValues) => {
    try {
      await onSubmit({
        ...values,
        stage: currentStage,
      });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const handleStageChange = (newStage: TransactionStage) => {
    setCurrentStage(newStage);
    form.setValue('stage', newStage);
  };

  const addOutgoingItem = () => {
    appendOutgoing({ itemId: "", quantity: 1, swapReason: "" });
  };

  const addIncomingItem = () => {
    appendIncoming({ itemId: "", quantity: 1 });
  };

  return (
    <Card className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-amber-100">
            <RefreshCw className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              Swap Transaction
            </CardTitle>
            <CardDescription>Exchange items between storerooms</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requestedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested By</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="swapDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Swap Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      The storeroom from which items will be sent
                    </FormDescription>
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
                          <SelectItem key={storeroom.id} value={storeroom.id}>
                            {storeroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The storeroom from which items will be received
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Outgoing Items Section */}
            <div className="space-y-4 p-4 border border-gray-200 border-opacity-20 rounded-md bg-red-50 bg-opacity-10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Outgoing Items (From Source)
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOutgoingItem}
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {outgoingFields &&
                  outgoingFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 border-opacity-20 rounded-md relative bg-white bg-opacity-50"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removeOutgoing(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`outgoingItems.${index}.itemId`}
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
                      </div>

                      <div className="w-full md:w-24">
                        <FormField
                          control={form.control}
                          name={`outgoingItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-full md:w-48">
                        <FormField
                          control={form.control}
                          name={`outgoingItems.${index}.swapReason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Swap Reason</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Enter swap reason"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Incoming Items Section */}
            <div className="space-y-4 p-4 border border-gray-200 border-opacity-20 rounded-md bg-green-50 bg-opacity-10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Incoming Items (From Destination)
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIncomingItem}
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {incomingFields &&
                  incomingFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 border-opacity-20 rounded-md relative bg-white bg-opacity-50"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removeIncoming(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`incomingItems.${index}.itemId`}
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
                      </div>

                      <div className="w-full md:w-24">
                        <FormField
                          control={form.control}
                          name={`incomingItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TransactionWorkflow
              transactionType={TransactionType.Swap}
              initialStage={initialStage}
              userRole={userRole}
              transactionData={form.getValues()}
              onStageChange={handleStageChange}
              onSubmit={handleSubmit}
            />

            <div className="flex justify-between items-center">
              <div>
                <Badge variant="outline" className="mr-2">
                  Status: Draft
                </Badge>
                <Badge variant="secondary">Next Approval: Supervisor</Badge>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Swap"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 bg-opacity-30">
        <div className="text-sm text-gray-500">
          <p>This swap will be sent for approval after submission.</p>
        </div>
        <Button variant="ghost" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Attach Documents
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SwapForm;
