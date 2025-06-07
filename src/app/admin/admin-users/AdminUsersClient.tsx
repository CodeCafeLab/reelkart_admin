
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, UpdateAdminUserPayload } from "@/types/admin-user";
import { format } from 'date-fns';

// Placeholder for Add/Edit Dialogs - to be implemented later
// import { AddAdminUserDialog } from "./AddAdminUserDialog";
// import { EditAdminUserDialog } from "./EditAdminUserDialog";

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for dialogs - will be used when dialog components are created
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);


  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin-users");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error("Error fetching admin users:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error Fetching Users",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (user: AdminUser) => {
    const newStatus = !user.is_active;
    try {
      const payload: UpdateAdminUserPayload = { is_active: newStatus };
      const response = await fetch(`/api/admin-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update user status: ${response.statusText}`);
      }
      
      toast({
        title: "Status Updated",
        description: `${user.full_name || user.email}'s status changed to ${newStatus ? 'Active' : 'Inactive'}.`,
      });
      fetchUsers(); // Re-fetch users to reflect changes
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error("Error toggling user status:", errorMessage);
      toast({
        title: "Error Updating Status",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleEditUser = (user: AdminUser) => {
    // setEditingUser(user); // This will be used to open EditAdminUserDialog
    console.log("Edit user (placeholder):", user);
    toast({ title: "Edit Action (Placeholder)", description: `Would edit ${user.email}`});
  };

  const handleDeleteUser = (user: AdminUser) => {
    // setUserToDelete(user); // This will be used to open a confirmation dialog
    console.log("Delete user (placeholder):", user);
    toast({ title: "Delete Action (Placeholder)", description: `Would delete ${user.email}`, variant: "destructive"});
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading admin users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={fetchUsers} variant="outline" className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { /*setIsAddUserDialogOpen(true);*/ toast({title: "Add User (Placeholder)"}) } }>
          <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users List</CardTitle>
          <CardDescription>
            Manage all users who have access to this admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No admin users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'SuperAdmin' ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "outline"} className={user.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {user.last_login_at ? format(new Date(user.last_login_at), "PPpp") : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                            {user.is_active ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />} 
                            {user.is_active ? "Set Inactive" : "Set Active"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)} 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* 
      Placeholder for AddUserDialog - to be implemented later
      {isAddUserDialogOpen && (
        <AddAdminUserDialog
          isOpen={isAddUserDialogOpen}
          onClose={() => setIsAddUserDialogOpen(false)}
          onUserAdded={fetchUsers} 
        />
      )}
      */}
      
      {/* 
      Placeholder for EditUserDialog - to be implemented later
      {editingUser && (
        <EditAdminUserDialog
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdated={fetchUsers}
        />
      )}
      */}
    </>
  );
}
