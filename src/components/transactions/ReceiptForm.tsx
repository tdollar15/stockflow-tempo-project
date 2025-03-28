"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus, Upload, X, HelpCircle } from "lucide-react";
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

// Define the schema for receipt form validation
const receiptFormSchema = z.object({
  supplierName: z.string()
    .min(2, { message: "Supplier name must be at least 2 characters" })
    .max(100, { message: "Supplier name cannot exceed 100 characters" }),
  supplierReference: z
    .string()
    .min(3, { message: "Reference number must be at least 3 characters" })
    .max(50, { message: "Reference number cannot exceed 50 characters" })
    .regex(/^[A-Za-z0-9-]+$/, { message: "Reference number can only contain letters, numbers, and hyphens" }),
  destStoreroomId: z
    .string()
    .min(1, { message: "Destination storeroom is required" }),
  deliveryDate: z.string()
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        const maxPastDate = new Date();
        maxPastDate.setDate(today.getDate() - 30);
        return inputDate <= today && inputDate >= maxPastDate;
      },
      { message: "Delivery date must be today or within the last 30 days" }
    ),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, { message: "Item is required" }),
        quantity: z.number()
          .min(1, { message: "Quantity must be at least 1" })
          .max(1000, { message: "Quantity cannot exceed 1000" }),
        unitPrice: z.number()
          .min(0, { message: "Unit price cannot be negative" })
          .max(100000, { message: "Unit price is unreasonably high" }),
      })
    )
    .min(1, { message: "At least one item is required" })
    .max(50, { message: "Maximum of 50 items allowed per receipt" }),
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters" })
    .optional(),
  stage: z.nativeEnum(TransactionStage),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

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

interface ReceiptFormProps {
  items?: typeof defaultItems;
  storerooms?: typeof defaultStorerooms;
  onSubmit?: (values: ReceiptFormValues) => void;
  isLoading?: boolean;
  initialStage?: TransactionStage;
  userRole?: UserRole;
}

const ReceiptForm = ({
  items = defaultItems,
  storerooms = defaultStorerooms,
  onSubmit = (values: ReceiptFormValues) => console.log("Receipt submitted:", values),
  isLoading = false,
  initialStage = TransactionStage.Draft,
  userRole = UserRole.Clerk,
}: ReceiptFormProps) => {
  const [currentStage, setCurrentStage] = useState<TransactionStage>(initialStage);
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      supplierName: "",
      supplierReference: "",
      destStoreroomId: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      items: [{ itemId: "", quantity: 1, unitPrice: 0 }],
      notes: "",
      stage: initialStage,
    },
  });

  const { fields, append, remove } = form.control._fields.items || [];

  const handleSubmit = async (values: ReceiptFormValues) => {
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

  const addItem = () => {
    append({ itemId: "", quantity: 1, unitPrice: 0 });
  };

  return (
    <Card className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-100">
            <PackagePlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              Receipt Transaction
            </CardTitle>
            <CardDescription>
              Record items received from suppliers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Invoice or delivery note #"
                        {...field}
                      />
                    </FormControl>
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
                      The storeroom where the items will be received
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields &&
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 border-opacity-20 rounded-md relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => fields.length > 1 && remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`items.${index}.itemId`}
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
                          name={`items.${index}.quantity`}
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

                      <div className="w-full md:w-32">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
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
                  <div className="flex items-center gap-2">
                    <FormLabel>Additional Notes</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-500" /></TooltipTrigger>
                        <TooltipContent>
                          <p>Optional notes about the receipt. Use this to provide additional context or special instructions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information about this receipt" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TransactionWorkflow
              transactionType={TransactionType.Receipt}
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
                <Badge variant="secondary">Next Approval: Storeman</Badge>
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
                    "Submit Receipt"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 bg-opacity-30">
        <div className="text-sm text-gray-500">
          <p>This receipt will be sent for approval after submission.</p>
        </div>
        <Button variant="ghost" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Attach Documents
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReceiptForm;
