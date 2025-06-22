
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { SellerRole, SellerPackage } from "@/types/seller-package";
import { SELLER_ROLES } from "@/types/seller-package";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const addPackageSchema = z.object({
  name: z.string().min(3, "Plan name must be at least 3 characters."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  billing_interval: z.enum(["monthly", "annually", "one-time"]),
  featuresString: z.string().min(1, "Please enter at least one feature."), // Comma-separated string
  applicable_seller_roles: z.array(z.enum(SELLER_ROLES)).min(1, "Select at least one seller role."),
  is_active: z.boolean().default(true),
});

export type AddPackageFormValues = z.infer<typeof addPackageSchema>;

// This is the type of data the parent component expects when a package is added.
export type NewPackageData = Omit<SellerPackage, 'id' | 'created_at' | 'updated_at' | 'currency'>;


interface AddPackageSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPackageAdded: (data: NewPackageData) => void;
}

export function AddPackageSheet({ isOpen, onOpenChange, onPackageAdded }: AddPackageSheetProps) {
  const { toast } = useToast();
  const form = useForm<AddPackageFormValues>({
    resolver: zodResolver(addPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      billing_interval: "monthly",
      featuresString: "",
      applicable_seller_roles: [],
      is_active: true,
    },
  });

  const onSubmit = (values: AddPackageFormValues) => {
    const newPackage: NewPackageData = {
      name: values.name,
      description: values.description,
      price: values.price,
      billing_interval: values.billing_interval,
      features: values.featuresString.split(',').map(f => f.trim()).filter(f => f),
      applicable_seller_roles: values.applicable_seller_roles,
      is_active: values.is_active,
    };
    onPackageAdded(newPackage);
    form.reset(); // Reset form after submission
    onOpenChange(false); // Close the sheet
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] p-0">
        <ScrollArea className="h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b">
              <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary" />
                Add New Subscription Plan
              </SheetTitle>
              <SheetDescription>
                Fill in the details to create a new subscription plan for sellers.
              </SheetDescription>
            </SheetHeader>

            <div className="p-6 space-y-6 flex-grow">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Seller Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Briefly describe the plan and its benefits." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 499.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Interval</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="featuresString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter features, comma-separated (e.g., Feature 1, Another Feature, Max 5 Products)" {...field} />
                    </FormControl>
                    <FormDescription>
                      List all features included in this plan, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicable_seller_roles"
                render={() => (
                  <FormItem>
                    <FormLabel>Applicable Seller Roles</FormLabel>
                    <FormDescription>Select the seller types this plan applies to.</FormDescription>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto border p-3 rounded-md mt-2">
                      {SELLER_ROLES.map((role) => (
                        <FormField
                          key={role}
                          control={form.control}
                          name="applicable_seller_roles"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), role])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== role
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {role.replace(/([A-Z])/g, ' $1').trim()}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
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
                      <FormLabel>Activate Plan</FormLabel>
                      <FormDescription>
                        Make this plan available for selection upon creation.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="p-6 pt-4 border-t mt-auto">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Plan</>}
              </Button>
            </SheetFooter>
          </form>
        </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
