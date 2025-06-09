
"use client";

import React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AdminRole, CreateAdminUserPayload } from "@/types/admin-user";
import { ADMIN_ROLES, createAdminUserSchema } from "@/types/admin-user";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Form values will match CreateAdminUserPayload
type AddAdminUserFormValues = CreateAdminUserPayload;

interface AddAdminUserSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserAdded: (data: CreateAdminUserPayload) => void;
}

export function AddAdminUserSheet({ isOpen, onOpenChange, onUserAdded }: AddAdminUserSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AddAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: ADMIN_ROLES[0], // Default to the first role, or handle appropriately
      is_active: true,
    },
  });

  const onSubmit = async (values: AddAdminUserFormValues) => {
    setIsLoading(true);
    // Simulate API call delay for local data
    await new Promise(resolve => setTimeout(resolve, 500));

    onUserAdded(values); // Pass the form values
    
    toast({
      title: "User Added (Locally)",
      description: `Admin user ${values.email} has been added to the local list.`,
    });
    
    setIsLoading(false);
    form.reset(); 
    onOpenChange(false); // Close the sheet
  };
  
  const handleClose = () => {
    if (!isLoading) {
        form.reset(); 
        onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg w-[90vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Add New Admin User (Local Data)
          </SheetTitle>
          <SheetDescription>
            Fill in the details to create a new admin user for the panel. Data is local.
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
                      <Input placeholder="Enter full name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password (min 8 chars)" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        Controls whether the user can log in immediately.
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
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Add User
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
