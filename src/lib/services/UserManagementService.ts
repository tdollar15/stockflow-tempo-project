import { z } from 'zod';
import { UserSchema, UserRole, Department, User, getUserPermissions, getDepartmentRoles } from '../types/UserTypes';

// User creation schema
export const UserCreationSchema = UserSchema.omit({ 
  id: true, 
  createdAt: true, 
  isActive: true 
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export class UserManagementService {
  // Mock user storage (replace with actual database in production)
  private static users: User[] = [];

  // Create a new user
  createUser(userData: z.infer<typeof UserCreationSchema>): User {
    // Validate input
    const validatedData = UserCreationSchema.parse(userData);

    // Generate unique ID (replace with proper ID generation in production)
    const newUser: User = {
      id: crypto.randomUUID(),
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      department: validatedData.department,
      storerooms: validatedData.storerooms || [],
      isActive: true,
      createdAt: new Date(),
      lastLogin: undefined
    };

    // Validate role is compatible with department
    this.validateRoleDepartmentCompatibility(newUser.role, newUser.department);

    // Store user
    UserManagementService.users.push(newUser);

    return newUser;
  }

  // Update existing user
  updateUser(userId: string, updateData: Partial<z.infer<typeof UserSchema>>): User {
    const userIndex = UserManagementService.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Merge existing user with update data
    const updatedUser = {
      ...UserManagementService.users[userIndex],
      ...updateData,
      // Preserve immutable fields
      id: userId,
      createdAt: UserManagementService.users[userIndex].createdAt
    };

    // Validate updated user
    UserSchema.parse(updatedUser);

    // Validate role is compatible with department
    this.validateRoleDepartmentCompatibility(updatedUser.role, updatedUser.department);

    // Update user
    UserManagementService.users[userIndex] = updatedUser;

    return updatedUser;
  }

  // Get user by ID
  getUserById(userId: string): User {
    const user = UserManagementService.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // List users with optional filtering
  listUsers(filters?: {
    department?: Department,
    role?: UserRole,
    isActive?: boolean
  }): User[] {
    return UserManagementService.users.filter(user => {
      if (filters?.department && user.department !== filters.department) return false;
      if (filters?.role && user.role !== filters.role) return false;
      if (filters?.isActive !== undefined && user.isActive !== filters.isActive) return false;
      return true;
    });
  }

  // Validate role is compatible with department
  private validateRoleDepartmentCompatibility(role: UserRole, department: Department): void {
    const allowedRoles = getDepartmentRoles(department);
    
    if (!allowedRoles.includes(role)) {
      throw new Error(`Role ${role} is not compatible with department ${department}`);
    }
  }

  // Get user permissions
  getUserPermissions(userId: string) {
    const user = this.getUserById(userId);
    return getUserPermissions(user.role);
  }

  // Deactivate user
  deactivateUser(userId: string): User {
    return this.updateUser(userId, { isActive: false });
  }

  // Reactivate user
  reactivateUser(userId: string): User {
    return this.updateUser(userId, { isActive: true });
  }
}

export const userManagementService = new UserManagementService();
