import { z } from 'zod';

export enum UserRole {
  // Core Roles
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  STOREMAN = 'STOREMAN',

  // Enhanced Strategic Roles
  CLERK = 'CLERK',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  FINANCIAL_CONTROLLER = 'FINANCIAL_CONTROLLER',

  // Specific Workflow Roles
  SUPPLIER_DELIVERY_GUY = 'SUPPLIER_DELIVERY_GUY',
  SUPPLIER_SUPERVISOR = 'SUPPLIER_SUPERVISOR'
}

export enum Department {
  INVENTORY = 'INVENTORY',
  LOGISTICS = 'LOGISTICS',
  FINANCE = 'FINANCE',
  OPERATIONS = 'OPERATIONS',
  PROCUREMENT = 'PROCUREMENT',
  SALES = 'SALES',
  ADMINISTRATION = 'ADMINISTRATION'
}

// Zod schema for user validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
  department: z.nativeEnum(Department),
  storerooms: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  lastLogin: z.date().optional()
});

export interface User extends z.infer<typeof UserSchema> {}

export interface UserPermissions {
  canCreateTransactions: boolean;
  canApproveTransactions: boolean;
  canManageStorerooms: boolean;
  canConfigureSystem: boolean;
}

export function getUserPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case UserRole.ADMIN:
      return {
        canCreateTransactions: true,
        canApproveTransactions: true,
        canManageStorerooms: true,
        canConfigureSystem: true
      };
    case UserRole.SUPERVISOR:
      return {
        canCreateTransactions: false,
        canApproveTransactions: true,
        canManageStorerooms: true,
        canConfigureSystem: false
      };
    case UserRole.STOREMAN:
      return {
        canCreateTransactions: true,
        canApproveTransactions: false,
        canManageStorerooms: false,
        canConfigureSystem: false
      };
    case UserRole.CLERK:
      return {
        canCreateTransactions: true,
        canApproveTransactions: false,
        canManageStorerooms: false,
        canConfigureSystem: false
      };
    default:
      return {
        canCreateTransactions: false,
        canApproveTransactions: false,
        canManageStorerooms: false,
        canConfigureSystem: false
      };
  }
}

export function getDepartmentRoles(department: Department): UserRole[] {
  const departmentRoleMap: Record<Department, UserRole[]> = {
    [Department.INVENTORY]: [
      UserRole.INVENTORY_MANAGER, 
      UserRole.CLERK
    ],
    [Department.LOGISTICS]: [
      UserRole.WAREHOUSE_MANAGER, 
      UserRole.SUPPLIER_DELIVERY_GUY
    ],
    [Department.FINANCE]: [
      UserRole.FINANCIAL_CONTROLLER
    ],
    [Department.OPERATIONS]: [
      UserRole.SUPERVISOR, 
      UserRole.STOREMAN
    ],
    [Department.PROCUREMENT]: [
      UserRole.SUPPLIER_SUPERVISOR
    ],
    [Department.SALES]: [],
    [Department.ADMINISTRATION]: [
      UserRole.ADMIN
    ]
  };

  return departmentRoleMap[department] || [];
}
