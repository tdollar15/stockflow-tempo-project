import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

import UserManagementForm from '../components/users/UserManagementForm';
import UserListComponent, { User } from '../components/users/UserListComponent';
import { UserRole, Department } from '../components/users/UserManagementForm';

const UserManagementPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: UserRole.Admin,
      department: Department.Administration,
      assignedStorerooms: ['store1', 'store2'],
      permissions: ['view_inventory', 'manage_users']
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: UserRole.Supervisor,
      department: Department.Inventory,
      assignedStorerooms: ['store2'],
      permissions: ['view_inventory', 'edit_inventory']
    },
  ]);

  const handleCreateUser = (newUser: Omit<User, 'id'>) => {
    const user = {
      ...newUser,
      id: `user_${users.length + 1}`,
    };
    setUsers([...users, user]);
  };

  const handleEditUser = (values: Omit<User, 'id'>) => {
    setUsers(users.map(user => 
      user.id === selectedUser?.id 
        ? { ...values, id: selectedUser.id } 
        : user
    ));
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleEditButtonClick = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">User List</TabsTrigger>
              <TabsTrigger value="create">Create User</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <UserListComponent 
                users={users}
                onEditUser={handleEditButtonClick}
                onDeleteUser={handleDeleteUser}
              />
            </TabsContent>
            
            <TabsContent value="create">
              <UserManagementForm 
                onSubmit={handleCreateUser}
                isEditing={false}
              />
            </TabsContent>
          </Tabs>

          {/* Edit User Dialog */}
          <Dialog 
            open={!!selectedUser} 
            onOpenChange={() => setSelectedUser(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <UserManagementForm 
                  initialData={selectedUser}
                  onSubmit={handleEditUser}
                  isEditing={true}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
