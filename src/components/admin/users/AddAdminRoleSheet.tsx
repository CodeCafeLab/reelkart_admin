
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShieldPlus, Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const addAdminRoleSchema = z.object({
  roleName: z.string().min(3, "Role name must be at least 3 characters.").max(50, "Role name must be 50 characters or less."),
});

type AddAdminRoleFormValues = z.infer<typeof addAdminRoleSchema>;

interface AddAdminRoleSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRoleAdded: (roleName: string) => void;
}

export function AddAdminRoleSheet({ isOpen, onOpenChange, onRoleAdded }: AddAdminRoleSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AddAdminRoleFormValues>({
    resolver: zodResolver(addAdminRoleSchema),
    defaultValues: {
      roleName: "",
    },
  });

  const onSubmit = async (values: AddAdminRoleFormValues) => {
    setIsLoading(true);
    // Simulate some delay if needed, or call an API in the future
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onRoleAdded(values.roleName);
    
    // Toast is handled by the parent component (AdminUsersClient) to check for duplicates
    
    setIsLoading(false);
    form.reset(); 
    // onOpenChange(false); // Parent will close it after successful add
  };
  
  const handleClose = () => {
    if (!isLoading) {
        form.reset(); 
        onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md w-[90vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <ShieldPlus className="h-6 w-6 text-primary" />
            Add New Custom Role (Local)
          </SheetTitle>
          <SheetDescription>
            Define a new role name. Permissions can be configured after creation. This role is managed locally.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MarketingManager, Intern" {...field} />
                    </FormControl>
                    <FormMessage />
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
            Add Role
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
