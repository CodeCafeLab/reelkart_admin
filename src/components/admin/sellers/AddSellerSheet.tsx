
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { SellerRole } from "@/types/seller-package";
import { SELLER_ROLES } from "@/types/seller-package";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type for the form values
const addSellerFormSchema = z.object({
  contactName: z.string().min(2, "Contact name is required."),
  businessName: z.string().min(2, "Business name is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  sellerType: z.enum(SELLER_ROLES),
  status: z.enum(["Pending", "Approved", "Rejected"] as const).default("Pending"),
  
  socialPlatform: z.string().optional(),
  socialLink: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  bankName: z.string().optional(),
}).refine(data => !(data.socialPlatform && !data.socialLink), {
  message: "Social link is required if platform is selected",
  path: ["socialLink"],
}).refine(data => !(!data.socialPlatform && data.socialLink), {
  message: "Social platform is required if link is provided",
  path: ["socialPlatform"],
});

export type NewSellerFormData = z.infer<typeof addSellerFormSchema>;

interface AddSellerSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSellerAdded: (data: NewSellerFormData) => void;
}

export function AddSellerSheet({ isOpen, onOpenChange, onSellerAdded }: AddSellerSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<NewSellerFormData>({
    resolver: zodResolver(addSellerFormSchema),
    defaultValues: {
      contactName: "",
      businessName: "",
      email: "",
      phone: "",
      sellerType: SELLER_ROLES[0], 
      status: "Pending",
      socialPlatform: "",
      socialLink: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const onSubmit = async (values: NewSellerFormData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    onSellerAdded(values); 
    
    setIsLoading(false);
    form.reset(); 
    onOpenChange(false); 
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
            <PlusCircle className="h-6 w-6 text-primary" />
            Add New Seller (Local Data)
          </SheetTitle>
          <SheetDescription>
            Fill in the details to manually create a new seller profile.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Acme Corp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select seller type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {SELLER_ROLES.map(role => (
                          <SelectItem key={role} value={role}>{role.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select initial status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(["Pending", "Approved", "Rejected"] as const).map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h4 className="text-md font-semibold pt-2 border-t mt-4">Optional Details</h4>
              
              <FormField
                control={form.control}
                name="socialPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select platform (optional)" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Twitter">Twitter (X)</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Link</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl><Input placeholder="Full name on bank account" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Number</FormLabel>
                    <FormControl><Input placeholder="e.g., 123456789012" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl><Input placeholder="e.g., HDFC0000123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl><Input placeholder="e.g., HDFC Bank" {...field} /></FormControl>
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
            Add Seller
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    