"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Upload, X, HelpCircle } from "lucide-react";
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

// Define the schema for issuance form validation
const issuanceFormSchema = z.object({
  requestedBy: z.string().min(1, { message: "Requester name is required" })
    .max(50, { message: "Name must be 50 characters or less" }),
  department: z.string().min(1, { message: "Department is required" }),
  sourceStoreroomId: z
    .string()
    .min(1, { message: "Source storeroom is required" }),
  requestDate: z.string()
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setDate(today.getDate() + 30);
        return inputDate >= today && inputDate <= maxFutureDate;
      },
      { message: "Request date must be today or within the next 30 days" }
    ),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, { message: "Item is required" }),
        quantity: z.number()
          .min(1, { message: "Quantity must be at least 1" })
          .max(100, { message: "Quantity cannot exceed 100" }),
        purpose: z.string()
          .min(5, { message: "Purpose must be at least 5 characters" })
          .max(200, { message: "Purpose cannot exceed 200 characters" }),
      })
    )
    .min(1, { message: "At least one item is required" })
    .max(10, { message: "Maximum of 10 items allowed per transaction" }),
  justification: z.string()
    .min(10, { message: "Justification must be at least 10 characters" })
    .max(500, { message: "Justification cannot exceed 500 characters" }),
  stage: z.nativeEnum(TransactionStage),
});

type IssuanceFormValues = z.infer<typeof issuanceFormSchema>;

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

const defaultDepartments = [
  { id: "dept1", name: "IT" },
  { id: "dept2", name: "Engineering" },
  { id: "dept3", name: "Sales" },
  { id: "dept4", name: "Marketing" },
  { id: "dept5", name: "Finance" },
  { id: "dept6", name: "HR" },
];

interface IssuanceFormProps {
  items?: typeof defaultItems;
  storerooms?: typeof defaultStorerooms;
  departments?: typeof defaultDepartments;
  onSubmit?: (values: IssuanceFormValues) => void;
  isLoading?: boolean;
  initialStage?: TransactionStage;
  userRole?: UserRole;
}

const IssuanceForm = ({
  items = defaultItems,
  storerooms = defaultStorerooms,
  departments = defaultDepartments,
  onSubmit = (values: IssuanceFormValues) => console.log("Issuance submitted:", values),
  isLoading = false,
  initialStage = TransactionStage.Draft,
  userRole = UserRole.Clerk,
}: IssuanceFormProps) => {
  const [currentStage, setCurrentStage] = useState<TransactionStage>(initialStage);
  const form = useForm<IssuanceFormValues>({
    resolver: zodResolver(issuanceFormSchema),
    defaultValues: {
      requestedBy: "",
      department: "",
      sourceStoreroomId: "",
      requestDate: new Date().toISOString().split("T")[0],
      items: [{ itemId: "", quantity: 1, purpose: "" }],
      justification: "",
      stage: initialStage,
    },
  });

  const { fields, append, remove } = form.control._fields.items || [];

  const addItem = () => {
    append({ itemId: "", quantity: 1, purpose: "" });
  };

  const handleSubmit = async (values: IssuanceFormValues) => {
    try {
      await onSubmit({
        ...values,
        stage: currentStage,
      });
    } catch (error) {
      // Handle submission error
      console.error("Submission error:", error);
    }
  };

  const handleStageChange = (newStage: TransactionStage) => {
    setCurrentStage(newStage);
    form.setValue('stage', newStage);
  };

  return (
    <Card className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100">
            <Send className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              Issuance Transaction
            </CardTitle>
            <CardDescription>
              Request items to be issued from inventory
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
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

              <FormField
                control={form.control}
                name="requestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Date</FormLabel>
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
                      className="flex flex-col gap-4 p-4 border border-gray-200 border-opacity-20 rounded-md relative"
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
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

                        <div>
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
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.purpose`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Explain why this item is needed"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Justification</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-500" /></TooltipTrigger>
                        <TooltipContent>
                          <p>Provide a clear reason for this item issuance. This helps track and audit inventory movements.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain the purpose and necessity of this item issuance" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TransactionWorkflow
              transactionType={TransactionType.Issuance}
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
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 bg-opacity-30">
        <div className="text-sm text-gray-500">
          <p>This request will be sent for approval after submission.</p>
        </div>
        <Button variant="ghost" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Attach Documents
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssuanceForm;
