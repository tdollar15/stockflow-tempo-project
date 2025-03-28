import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

// Enum for user roles
export enum UserRole {
  Admin = 'Admin',
  Supervisor = 'Supervisor',
  Storeman = 'Storeman',
  Clerk = 'Clerk',
  InventoryManager = 'Inventory Manager',
  WarehouseManager = 'Warehouse Manager',
  FinancialController = 'Financial Controller'
}

// Enum for departments
export enum Department {
  Inventory = 'Inventory',
  Logistics = 'Logistics',
  Finance = 'Finance',
  Operations = 'Operations',
  Administration = 'Administration'
}

// Zod schema for user management form
const userManagementSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.nativeEnum(UserRole),
  department: z.nativeEnum(Department),
  permissions: z.array(z.string()).optional(),
  assignedStorerooms: z.array(z.string()).optional(),
});

type UserManagementFormValues = z.infer<typeof userManagementSchema>;

// Mock data for storerooms and permissions
const defaultStorerooms = [
  { id: 'store1', name: 'Main Warehouse' },
  { id: 'store2', name: 'East Storage' },
  { id: 'store3', name: 'West Storage' },
];

const defaultPermissions = [
  'view_inventory',
  'edit_inventory',
  'create_transaction',
  'approve_transaction',
  'manage_users',
];

interface UserManagementFormProps {
  initialData?: Partial<UserManagementFormValues>;
  onSubmit?: (values: UserManagementFormValues) => void;
  isEditing?: boolean;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({
  initialData,
  onSubmit = (values) => console.log('User submitted:', values),
  isEditing = false,
}) => {
  const form = useForm<UserManagementFormValues>({
    resolver: zodResolver(userManagementSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      role: initialData?.role || UserRole.Storeman,
      department: initialData?.department || Department.Inventory,
      permissions: initialData?.permissions || [],
      assignedStorerooms: initialData?.assignedStorerooms || [],
    },
  });

  const { fields: permissionFields, append: appendPermission, remove: removePermission } = useFieldArray({
    control: form.control,
    name: 'permissions',
  });

  const { fields: storeroomFields, append: appendStoreroom, remove: removeStoreroom } = useFieldArray({
    control: form.control,
    name: 'assignedStorerooms',
  });

  const handleSubmit = (values: UserManagementFormValues) => {
    onSubmit(values);
    if (!isEditing) {
      form.reset();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit User' : 'Create New User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(UserRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Department).map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Assigned Storerooms</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {storeroomFields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center">
                    {defaultStorerooms.find(s => s.id === field.value)?.name || field.value}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeStoreroom(index)}
                      className="ml-2 h-4 w-4 p-0"
                    >
                      ✕
                    </Button>
                  </Badge>
                ))}
              </div>
              <Select 
                onValueChange={(value) => {
                  if (!storeroomFields.some(f => f.value === value)) {
                    appendStoreroom(value);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Add storeroom" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {defaultStorerooms.map((storeroom) => (
                    <SelectItem key={storeroom.id} value={storeroom.id}>
                      {storeroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Permissions</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {permissionFields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center">
                    {field.value}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removePermission(index)}
                      className="ml-2 h-4 w-4 p-0"
                    >
                      ✕
                    </Button>
                  </Badge>
                ))}
              </div>
              <Select 
                onValueChange={(value) => {
                  if (!permissionFields.some(f => f.value === value)) {
                    appendPermission(value);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Add permission" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {defaultPermissions.map((permission) => (
                    <SelectItem key={permission} value={permission}>
                      {permission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <Button type="submit" className="w-full">
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserManagementForm;
