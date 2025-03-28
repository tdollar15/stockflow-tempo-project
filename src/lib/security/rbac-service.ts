import { z } from 'zod';

// Define role types based on previous memories
export const RoleSchema = z.enum([
  'admin', 
  'supervisor', 
  'storeman', 
  'clerk', 
  'inventory_manager', 
  'warehouse_manager', 
  'financial_controller'
]);

export type Role = z.infer<typeof RoleSchema>;

// Permission definition
export interface Permission {
  action: string;
  resource: string;
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { action: 'manage', resource: 'inventory' },
    { action: 'manage', resource: 'storeroom' },
    { action: 'approve', resource: 'transaction' },
    { action: 'configure', resource: 'system' }
  ],
  supervisor: [
    { action: 'view', resource: 'inventory' },
    { action: 'manage', resource: 'storeroom' },
    { action: 'approve', resource: 'transaction' }
  ],
  storeman: [
    { action: 'view', resource: 'inventory' },
    { action: 'create', resource: 'transaction' }
  ],
  clerk: [
    { action: 'create', resource: 'transaction' },
    { action: 'view', resource: 'transaction' }
  ],
  inventory_manager: [
    { action: 'view', resource: 'inventory' },
    { action: 'analyze', resource: 'inventory' },
    { action: 'export', resource: 'inventory' }
  ],
  warehouse_manager: [
    { action: 'view', resource: 'storeroom' },
    { action: 'manage', resource: 'storeroom' }
  ],
  financial_controller: [
    { action: 'view', resource: 'transaction' },
    { action: 'analyze', resource: 'transaction' }
  ]
};

export class RBACService {
  // Check if a role has a specific permission
  static hasPermission(role: Role, action: string, resource: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.some(
      perm => perm.action === action && perm.resource === resource
    );
  }

  // Get allowed actions for a specific role and resource
  static getAllowedActions(role: Role, resource: string): string[] {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions
      .filter(perm => perm.resource === resource)
      .map(perm => perm.action);
  }

  // Validate user action based on role
  static validateAction(
    role: Role, 
    action: string, 
    resource: string
  ): boolean {
    if (!RoleSchema.safeParse(role).success) {
      throw new Error('Invalid role');
    }

    const hasPermission = this.hasPermission(role, action, resource);
    
    if (!hasPermission) {
      console.warn(`Role ${role} does not have ${action} permission for ${resource}`);
    }

    return hasPermission;
  }

  // Create a permission-aware wrapper for actions
  static createPermissionWrapper<T extends (...args: any[]) => any>(
    role: Role,
    resource: string,
    action: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      if (this.validateAction(role, action, resource)) {
        return fn(...args);
      }
      throw new Error(`Unauthorized: ${role} cannot ${action} ${resource}`);
    }) as T;
  }
}

// Utility type for type-safe permission checking
export type PermissionCheck = {
  role: Role;
  action: string;
  resource: string;
};
