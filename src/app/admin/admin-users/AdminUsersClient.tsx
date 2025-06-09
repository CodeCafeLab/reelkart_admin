
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle, ShieldPlus, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, UpdateAdminUserPayload, AdminRole, Permission, CreateAdminUserPayload } from "@/types/admin-user";
import { ADMIN_ROLES, PERMISSIONS } from "@/types/admin-user";
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EditAdminUserSheet } from "@/components/admin/users/EditAdminUserSheet";
import { AddAdminUserSheet } from "@/components/admin/users/AddAdminUserSheet";
import { AddAdminRoleSheet } from "@/components/admin/users/AddAdminRoleSheet";

// Mock data for admin users
const initialMockAdminUsers: AdminUser[] = [
  {
    id: "user_1",
    email: "superadmin@example.com",
    full_name: "Super Admin",
    role: "SuperAdmin",
    last_login_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_2",
    email: "kycreviewer@example.com",
    full_name: "KYC Reviewer Person",
    role: "KYCReviewer",
    last_login_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "user_3",
    email: "contentmod@example.com",
    full_name: "Content Mod",
    role: "ContentModerator",
    last_login_at: null,
    is_active: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "user_4",
    email: "logisticmanager@example.com",
    full_name: "Logistics Head",
    role: "LogisticsManager",
    last_login_at: new Date().toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
];


export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>(initialMockAdminUsers);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 
  const { toast } = useToast();

  const [isAddUserSheetOpen, setIsAddUserSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  const [isAddRoleSheetOpen, setIsAddRoleSheetOpen] = useState(false);
  const [customRoles, setCustomRoles] = useState<string[]>([]); // Store custom role names

  const allDisplayableRoles = useMemo(() => {
    const combined = new Set([...ADMIN_ROLES, ...customRoles]);
    return Array.from(combined);
  }, [customRoles]);


  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | "">(""); // Can be AdminRole or custom string
  const [rolePermissions, setRolePermissions] = useState<Record<Permission, boolean>>(() => {
    const initial: Record<Permission, boolean> = {} as Record<Permission, boolean>;
    PERMISSIONS.forEach(p => initial[p] = false);
    return initial;
  });


  const handleToggleActive = (userToToggle: AdminUser) => {
    const newStatus = !userToToggle.is_active;
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userToToggle.id ? { ...user, is_active: newStatus, updated_at: new Date().toISOString() } : user
      )
    );
    toast({
      title: "Status Updated",
      description: `${userToToggle.full_name || userToToggle.email}'s status changed to ${newStatus ? 'Active' : 'Inactive'}.`,
    });
  };
  
  const handleEditUserClick = (user: AdminUser) => {
    setEditingUser(user);
    setIsEditSheetOpen(true);
  };

  const handleUserUpdatedInSheet = (updatedUserPartial: Partial<AdminUser> & { id: string }) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === updatedUserPartial.id
          ? { ...user, ...updatedUserPartial, updated_at: new Date().toISOString() }
          : user
      )
    );
    setIsEditSheetOpen(false);
    toast({
        title: "User Updated Locally",
        description: `User ${updatedUserPartial.full_name || updatedUserPartial.email || 'Unknown user'} has been updated.`,
    });
  };

  const handleUserAdded = (newUserData: CreateAdminUserPayload) => {
    const newUser: AdminUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Simple unique ID for local
      email: newUserData.email,
      full_name: newUserData.full_name || null,
      role: newUserData.role,
      is_active: newUserData.is_active !== undefined ? newUserData.is_active : true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setIsAddUserSheetOpen(false);
  };


  const handleDeleteUser = (user: AdminUser) => {
    if (window.confirm(`Are you sure you want to delete user ${user.email}? This action is local and cannot be undone.`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      toast({ title: "User Deleted (Local)", description: `User ${user.email} has been removed from the local list.`, variant: "destructive"});
    }
  };

  const handleCustomRoleAdded = (newRoleName: string) => {
    const formattedRoleName = newRoleName.trim();
    if (!formattedRoleName) {
      toast({ title: "Invalid Role Name", description: "Role name cannot be empty.", variant: "destructive" });
      return;
    }
    const combinedRoles = [...ADMIN_ROLES, ...customRoles];
    if (combinedRoles.some(role => role.toLowerCase() === formattedRoleName.toLowerCase())) {
      toast({ title: "Duplicate Role", description: `Role "${formattedRoleName}" already exists.`, variant: "destructive" });
      return;
    }
    setCustomRoles(prev => [...prev, formattedRoleName]);
    toast({ title: "Custom Role Added", description: `Role "${formattedRoleName}" added to the local list.` });
    setIsAddRoleSheetOpen(false);
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
    toast({ title: "Save Permissions (Local Placeholder)", description: `Permissions for ${selectedRoleForPermissions} would be saved. Data is local.`});
  };

  useEffect(() => {
    if (selectedRoleForPermissions) {
      const newPerms = {} as Record<Permission, boolean>;
      // Check if it's a predefined role to apply existing logic
      if (ADMIN_ROLES.includes(selectedRoleForPermissions as AdminRole)) {
        const role = selectedRoleForPermissions as AdminRole;
        PERMISSIONS.forEach((p, index) => {
          if (role === 'SuperAdmin') {
            newPerms[p] = true;
          } else if (role === 'KYCReviewer' && (p === 'manage_kyc_submissions' || p.startsWith('view_'))) {
             newPerms[p] = true;
          } else {
            if (role === 'ContentModerator') newPerms[p] = p === 'moderate_content' || p.startsWith('view_');
            else if (role === 'LogisticsManager') newPerms[p] = p === 'manage_order_logistics' || p.startsWith('view_');
            else newPerms[p] = index % 3 === 0; 
          }
        });
      } else { // For custom roles, default all permissions to false
        PERMISSIONS.forEach(p => newPerms[p] = false);
      }
      setRolePermissions(newPerms);
    } else {
      const resetPerms = {} as Record<Permission, boolean>;
      PERMISSIONS.forEach(p => resetPerms[p] = false);
      setRolePermissions(resetPerms);
    }
  }, [selectedRoleForPermissions]);


  if (isLoading && users.length === 0) { 
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading admin users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>Admin Users List (Local Data)</CardTitle>
              <CardDescription>
                Manage all users who have access to this admin panel. Data is currently local.
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddUserSheetOpen(true) }>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Admin User
            </Button>
          </div>
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
                    No admin users found (local data). Click "Add New Admin User" to add one.
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
                        {user.last_login_at ? format(parseISO(user.last_login_at), "PPpp") : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions for {user.email}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUserClick(user)}>
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
                    <CardTitle>Role & Permission Management (Mock UI)</CardTitle>
                    <CardDescription>Define admin roles and their access permissions. (This is a mock UI with local state)</CardDescription>
                </div>
                 <Button onClick={() => setIsAddRoleSheetOpen(true)} variant="outline">
                    <ShieldPlus className="mr-2 h-4 w-4" /> Add New Role
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Existing Roles</h3>
                <div className="flex flex-wrap gap-2">
                    {allDisplayableRoles.map(role => (
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
                         <Select value={selectedRoleForPermissions} onValueChange={(value) => setSelectedRoleForPermissions(value as string)}>
                            <SelectTrigger id="role-select">
                                <SelectValue placeholder="Select a role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allDisplayableRoles.map(role => (
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
      
      {editingUser && (
        <EditAdminUserSheet
          isOpen={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          user={editingUser}
          onUserUpdated={handleUserUpdatedInSheet}
        />
      )}
      
      <AddAdminUserSheet
        isOpen={isAddUserSheetOpen}
        onOpenChange={setIsAddUserSheetOpen}
        onUserAdded={handleUserAdded}
      />

      <AddAdminRoleSheet
        isOpen={isAddRoleSheetOpen}
        onOpenChange={setIsAddRoleSheetOpen}
        onRoleAdded={handleCustomRoleAdded}
      />
      
    </div>
  );
}

