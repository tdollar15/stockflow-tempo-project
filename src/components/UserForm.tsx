import React, { useState } from 'react';
import { z } from 'zod';
import { UserRole, Department, UserCreationSchema } from '../lib/types/UserTypes';
import { userManagementService } from '../lib/services/UserManagementService';

interface UserFormProps {
  initialUser?: z.infer<typeof UserCreationSchema>;
  onUserSaved?: (user: any) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  initialUser, 
  onUserSaved 
}) => {
  const [formData, setFormData] = useState(initialUser || {
    name: '',
    email: '',
    role: '' as UserRole,
    department: '' as Department,
    password: '',
    confirmPassword: '',
    storerooms: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = UserCreationSchema.parse(formData);
      
      // Create or update user
      const user = initialUser 
        ? userManagementService.updateUser(initialUser.id, validatedData)
        : userManagementService.createUser(validatedData);
      
      // Clear errors
      setErrors({});
      
      // Call callback if provided
      onUserSaved?.(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more readable format
        const errorMap = error.flatten().fieldErrors;
        const formattedErrors: Record<string, string> = {};
        
        Object.entries(errorMap).forEach(([key, messages]) => {
          formattedErrors[key] = messages?.[0] || 'Invalid input';
        });
        
        setErrors(formattedErrors);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
        >
          {Object.values(Department).map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && <span className="error">{errors.department}</span>}
      </div>

      <div>
        <label>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          {Object.values(UserRole).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        {errors.role && <span className="error">{errors.role}</span>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>

      <button type="submit">
        {initialUser ? 'Update User' : 'Create User'}
      </button>
    </form>
  );
};
