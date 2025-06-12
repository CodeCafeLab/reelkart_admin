
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { BroadcastMessageItem, BroadcastMessageAudienceType, CreateBroadcastMessageFormValues } from "@/types/broadcast-messages"; // Updated import
import { BROADCAST_MESSAGE_AUDIENCE_TYPES, createBroadcastMessageSchema } from "@/types/broadcast-messages"; // Updated import
import { useToast } from "@/hooks/use-toast";
import { Send, Edit, Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateBroadcastMessageSheetProps { // Renamed from CreateNotificationSheetProps
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CreateBroadcastMessageFormValues) => void;
  initialData?: BroadcastMessageItem | null; 
}

export function CreateBroadcastMessageSheet({ // Renamed from CreateNotificationSheet
  isOpen, 
  onOpenChange, 
  onSubmit: parentOnSubmit, 
  initialData 
}: CreateBroadcastMessageSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateBroadcastMessageFormValues>({
    resolver: zodResolver(createBroadcastMessageSchema), // Updated schema
    defaultValues: {
      title: "",
      message: "",
      audienceType: BROADCAST_MESSAGE_AUDIENCE_TYPES[0],
      audienceTarget: "",
    },
  });

  const watchedAudienceType = form.watch("audienceType");

  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        title: initialData.title,
        message: initialData.message,
        audienceType: initialData.audienceType,
        audienceTarget: initialData.audienceTarget || "",
      });
    } else if (!initialData && isOpen) {
      form.reset(); 
    }
  }, [initialData, isOpen, form]);

  const handleSubmit = async (values: CreateBroadcastMessageFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    parentOnSubmit(values);
    setIsLoading(false);
  };
  
  const handleClose = () => {
    if (!isLoading) {
      form.reset(); 
      onOpenChange(false);
    }
  };
  
  const isTargetRequired = (audienceType: BroadcastMessageAudienceType | undefined) => {
    return audienceType === "SpecificUser" || audienceType === "SpecificSeller" || audienceType === "UserGroup" || audienceType === "SellerGroup";
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg w-[90vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            {initialData ? <Edit className="h-6 w-6 text-primary" /> : <Send className="h-6 w-6 text-primary" />}
            {initialData ? "Edit Broadcast Message" : "Create New Broadcast Message"}
          </SheetTitle>
          <SheetDescription>
            {initialData ? "Modify the details of the broadcast message." : "Compose and target your broadcast message. It will be saved as a draft."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekend Sale Alert!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter the full broadcast message here..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="audienceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BROADCAST_MESSAGE_AUDIENCE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isTargetRequired(watchedAudienceType) && (
                <FormField
                  control={form.control}
                  name="audienceTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Audience Target Value
                         (User ID, Seller ID, Group Name)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter target identifier" {...field} />
                      </FormControl>
                      <FormDescription>
                        Required for specific user/seller or group targeting.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </ScrollArea>
        
        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Save Changes" : "Create Message (as Draft)"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
