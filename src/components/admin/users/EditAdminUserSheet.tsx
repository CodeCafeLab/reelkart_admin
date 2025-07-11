
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Label removed as FormLabel is used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AdminUser, UpdateAdminUserPayload, AdminRole } from "@/types/admin-user";
import { ADMIN_ROLES, updateAdminUserSchema } from "@/types/admin-user";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Use the Zod schema directly for form validation
type EditAdminUserFormValues = z.infer<typeof updateAdminUserSchema>;

interface EditAdminUserSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: AdminUser | null;
  // Changed to pass the updated data back for local state management
  onUserUpdated: (updatedData: Partial<AdminUser> & { id: string }) => void; 
}

export function EditAdminUserSheet({ isOpen, onOpenChange, user, onUserUpdated }: EditAdminUserSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false); //isLoading state is now local to this sheet

  const form = useForm<EditAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: {
      full_name: "",
      role: undefined, 
      is_active: true,
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        full_name: user.full_name || "",
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (values: EditAdminUserFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "No user selected for editing.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const payload: Partial<AdminUser> & { id: string } = { id: user.id };
    let changesMade = false;

    if (values.full_name !== (user.full_name || "")) {
        payload.full_name = values.full_name;
        changesMade = true;
    }
    if (values.role && values.role !== user.role) {
        payload.role = values.role;
        changesMade = true;
    }
    // Ensure is_active is included if it changed, even if to false
    if (values.is_active !== user.is_active) {
        payload.is_active = values.is_active;
        changesMade = true;
    }
    
    if (!changesMade) {
      toast({ title: "No Changes", description: "No changes detected to save." });
      setIsLoading(false);
      onOpenChange(false); 
      return;
    }

    // Simulate local update
    onUserUpdated(payload);
    
    // The API call is removed for local data management
    // try {
    //   const response = await fetch(`/api/admin-users/${user.id}`, {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || `Failed to update user: ${response.statusText}`);
    //   }

    //   toast({
    //     title: "User Updated",
    //     description: `${user.email} has been successfully updated.`,
    //   });
    //   onUserUpdated(); // Prop onUserUpdated now handles data refresh and sheet closing
    // } catch (e) {
    //   const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    //   console.error("Error updating admin user:", errorMessage);
    //   toast({
    //     title: "Update Failed",
    //     description: errorMessage,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
    setIsLoading(false); // Remove if API call is re-enabled
  };
  
  const handleClose = () => {
    if (!isLoading) { // Prevent closing while a submission is in progress
        form.reset(); 
        onOpenChange(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg w-[90vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <Edit className="h-6 w-6 text-primary" />
            Edit Admin User (Local Data)
          </SheetTitle>
          <SheetDescription>
            Modify details for <span className="font-medium">{user?.email || "user"}</span>. Changes are local.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ADMIN_ROLES.map((roleOption) => (
                          <SelectItem key={roleOption} value={roleOption}>
                            {roleOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Controls whether the user can log in.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Active status"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        
        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
