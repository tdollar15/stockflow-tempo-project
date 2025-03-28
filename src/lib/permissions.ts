import { roleManager } from "./roles";

// Granular permissions for each role
export const GRANULAR_PERMISSIONS = {
  // Transaction-related permissions
  'transaction_create': {
    allowedRoles: ['admin', 'supervisor', 'storeman', 'clerk'],
    description: 'Ability to create new transactions'
  },
  'transaction_approve': {
    allowedRoles: ['admin', 'supervisor'],
    description: 'Ability to approve or reject transactions'
  },
  'transaction_view_all': {
    allowedRoles: ['admin', 'supervisor', 'financial-controller'],
    description: 'View all transactions across the system'
  },

  // Inventory-related permissions
  'inventory_view': {
    allowedRoles: ['admin', 'supervisor', 'storeman', 'inventory-manager'],
    description: 'View inventory details'
  },
  'inventory_update': {
    allowedRoles: ['admin', 'supervisor', 'inventory-manager'],
    description: 'Update inventory records'
  },
  'inventory_transfer': {
    allowedRoles: ['admin', 'supervisor', 'warehouse-manager'],
    description: 'Transfer inventory between storerooms'
  },

  // Storeroom-related permissions
  'storeroom_manage': {
    allowedRoles: ['admin', 'supervisor', 'warehouse-manager'],
    description: 'Manage storeroom configurations'
  },
  'storeroom_access': {
    allowedRoles: ['admin', 'supervisor', 'storeman', 'warehouse-manager'],
    description: 'Access specific storeroom details'
  },

  // System-related permissions
  'system_settings': {
    allowedRoles: ['admin'],
    description: 'Modify system-wide settings'
  },
  'user_management': {
    allowedRoles: ['admin'],
    description: 'Create, modify, or delete user accounts'
  },

  // Reporting permissions
  'reports_generate': {
    allowedRoles: ['admin', 'financial-controller', 'inventory-manager'],
    description: 'Generate system reports'
  }
};

// Permission management utility
export const PermissionManager = {
  /**
   * Check if a user has a specific permission
   * @param userId User's unique identifier
   * @param permission Permission to check
   * @returns Promise resolving to boolean
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Fetch user role
      const role = await roleManager.getUserRole(userId);
      
      if (!role) return false;

      // Check permission against granular permissions
      const permissionDetails = GRANULAR_PERMISSIONS[permission as keyof typeof GRANULAR_PERMISSIONS];
      
      return permissionDetails 
        ? permissionDetails.allowedRoles.includes(role)
        : false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  /**
   * Get all permissions for a specific user
   * @param userId User's unique identifier
   * @returns Promise resolving to array of permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // Fetch user role
      const role = await roleManager.getUserRole(userId);
      
      if (!role) return [];

      // Filter permissions based on user's role
      return Object.keys(GRANULAR_PERMISSIONS).filter(permission => 
        GRANULAR_PERMISSIONS[permission as keyof typeof GRANULAR_PERMISSIONS]
          .allowedRoles.includes(role)
      );
    } catch (error) {
      console.error('Fetching user permissions failed:', error);
      return [];
    }
  },

  /**
   * Conditionally render UI components based on permissions
   * @param userId User's unique identifier
   * @param permission Permission to check
   * @returns Promise resolving to boolean for conditional rendering
   */
  async canRenderComponent(userId: string, permission: string): Promise<boolean> {
    return this.hasPermission(userId, permission);
  }
};

export default PermissionManager;
