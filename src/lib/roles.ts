import { supabase } from './supabase-client';
import { z } from 'zod';

// Role hierarchy and permissions schema
const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  hierarchy_level: z.number().int().min(1).max(10)
});

// User role mapping schema
const UserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  storeroom_ids: z.array(z.string().uuid()).optional()
});

export class RoleManager {
  // Get user's current role
  async getUserRole(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      throw new Error('Unable to retrieve user role');
    }

    // Safely extract role name
    const roleName = data?.roles && Array.isArray(data.roles) 
      ? data.roles[0]?.name 
      : (data?.roles as any)?.name;

    return roleName || 'clerk';
  }

  // Get storerooms assigned to a specific user
  async getAssignedStorerooms(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('storeroom_ids')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching assigned storerooms:', error);
      return [];
    }

    return data?.storeroom_ids || [];
  }

  // Get storerooms managed by a supervisor
  async getManagedStorerooms(userId: string): Promise<string[]> {
    const userRole = await this.getUserRole(userId);

    // Only supervisors and admins can manage storerooms
    if (!['supervisor', 'admin'].includes(userRole)) {
      return [];
    }

    const { data, error } = await supabase
      .from('storeroom_managers')
      .select('storeroom_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching managed storerooms:', error);
      return [];
    }

    return data?.map(item => item.storeroom_id) || [];
  }

  // Check if a user has a specific permission
  async hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);

    const { data, error } = await supabase
      .from('roles')
      .select('permissions')
      .eq('name', userRole)
      .single();

    if (error) {
      console.error('Error checking permissions:', error);
      return false;
    }

    return data?.permissions?.includes(requiredPermission) || false;
  }

  // Get all permissions for a user's role
  async getUserPermissions(userId: string): Promise<string[]> {
    const userRole = await this.getUserRole(userId);

    const { data, error } = await supabase
      .from('roles')
      .select('permissions')
      .eq('name', userRole)
      .single();

    if (error) {
      console.error('Error retrieving user permissions:', error);
      return [];
    }

    return data?.permissions || [];
  }
}

// Create a singleton instance for easy importing
export const roleManager = new RoleManager();
