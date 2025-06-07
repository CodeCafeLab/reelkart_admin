
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle, ShieldPlus, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, UpdateAdminUserPayload, AdminRole, Permission } from "@/types/admin-user";
import { ADMIN_ROLES, PERMISSIONS } from "@/types/admin-user";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Placeholder for Add/Edit Dialogs - to be implemented later
// import { AddAdminUserDialog } from "./AddAdminUserDialog";
// import { EditAdminUserDialog } from "./EditAdminUserDialog";

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<AdminRole | "">("");
  const [rolePermissions, setRolePermissions] = useState<Record<Permission, boolean>>(() => {
    const initial: Record<Permission, boolean> = {} as Record<Permission, boolean>;
    PERMISSIONS.forEach(p => initial[p] = false);
    return initial;
  });

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
      fetchUsers(); 
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
    console.log("Edit user (placeholder):", user);
    toast({ title: "Edit Action (Placeholder)", description: `Would edit ${user.email}`});
  };

  const handleDeleteUser = (user: AdminUser) => {
    console.log("Delete user (placeholder):", user);
    toast({ title: "Delete Action (Placeholder)", description: `Would delete ${user.email}`, variant: "destructive"});
  };

  const handleAddNewRole = () => {
    toast({ title: "Add New Role (Placeholder)", description: "Functionality to create new roles to be implemented."});
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setRolePermissions(prev => ({ ...prev, [permission]: checked }));
  };
  
  const handleSavePermissions = () => {
    if (!selectedRoleForPermissions) {
      toast({ title: "No Role Selected", description: "Please select a role to save permissions.", variant: "destructive"});
      return;
    }
    console.log(`Saving permissions for role ${selectedRoleForPermissions}:`, rolePermissions);
    toast({ title: "Save Permissions (Placeholder)", description: `Permissions for ${selectedRoleForPermissions} would be saved.`});
  };

  // Effect to update mock permissions when role selection changes (replace with actual fetching later)
  useEffect(() => {
    if (selectedRoleForPermissions) {
      // Mock: SuperAdmin has all permissions, others have a subset
      const newPerms = {} as Record<Permission, boolean>;
      PERMISSIONS.forEach((p, index) => {
        if (selectedRoleForPermissions === 'SuperAdmin') {
          newPerms[p] = true;
        } else if (selectedRoleForPermissions === 'KYCReviewer' && (p === 'manage_kyc_submissions' || p.startsWith('view_'))) {
           newPerms[p] = true;
        } else {
          newPerms[p] = index % 3 === 0; // Arbitrary mock logic
        }
      });
      setRolePermissions(newPerms);
    } else {
      const resetPerms = {} as Record<Permission, boolean>;
      PERMISSIONS.forEach(p => resetPerms[p] = false);
      setRolePermissions(resetPerms);
    }
  }, [selectedRoleForPermissions]);


  if (isLoading && users.length === 0) { // Show loader only on initial load
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading admin users...</p>
      </div>
    );
  }

  if (error && users.length === 0) { // Show full error card only if no users could be loaded
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>Admin Users List</CardTitle>
              <CardDescription>
                Manage all users who have access to this admin panel.
              </CardDescription>
            </div>
            <Button onClick={() => { toast({title: "Add User (Placeholder)"}) } }>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Admin User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && users.length > 0 && ( // Show dismissible error if users are loaded but an error occurred (e.g. on update)
             <div className="mb-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5"/> <p>{error}</p>
             </div>
          )}
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
              {isLoading && users.length === 0 ? (
                 <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin inline-block text-muted-foreground" /></TableCell></TableRow>
              ) : users.length === 0 ? (
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
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle>Role & Permission Management</CardTitle>
                    <CardDescription>Define admin roles and their access permissions.</CardDescription>
                </div>
                 <Button onClick={handleAddNewRole} variant="outline">
                    <ShieldPlus className="mr-2 h-4 w-4" /> Add New Role
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Existing Roles</h3>
                <div className="flex flex-wrap gap-2">
                    {ADMIN_ROLES.map(role => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-lg font-medium mb-1">Manage Permissions for a Role</h3>
                <p className="text-sm text-muted-foreground mb-4">Select a role to view or edit its permissions. (This is a mock UI)</p>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="grid w-full sm:max-w-xs items-center gap-1.5">
                        <Label htmlFor="role-select">Select Role</Label>
                         <Select value={selectedRoleForPermissions} onValueChange={(value) => setSelectedRoleForPermissions(value as AdminRole)}>
                            <SelectTrigger id="role-select">
                                <SelectValue placeholder="Select a role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ADMIN_ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSavePermissions} disabled={!selectedRoleForPermissions || isLoading}>
                        <CheckSquare className="mr-2 h-4 w-4" /> Save Permissions for Role
                    </Button>
                </div>

                {selectedRoleForPermissions && (
                    <div className="mt-6">
                        <h4 className="font-medium mb-3">Permissions for {selectedRoleForPermissions}:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                            {PERMISSIONS.map(permission => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`perm-${permission}`} 
                                        checked={rolePermissions[permission]}
                                        onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                                    />
                                    <Label htmlFor={`perm-${permission}`} className="font-normal text-sm capitalize">
                                        {permission.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
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
    </div>
  );
}
