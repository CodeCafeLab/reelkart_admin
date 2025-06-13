
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ContentItem, PredefinedContentRejectionReason } from "@/types/content-moderation";
import { PREDEFINED_CONTENT_REJECTION_REASONS } from "@/types/content-moderation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface RejectContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem | null;
  onRejectSubmit: (contentId: string, reason: string) => void;
}

const rejectContentSchema = z.object({
  selectedReason: z.enum(PREDEFINED_CONTENT_REJECTION_REASONS, { 
    required_error: "Please select a rejection reason." 
  }),
  customReason: z.string().optional(),
}).refine(data => {
  if (data.selectedReason === "Other (Please specify)") {
    return data.customReason && data.customReason.trim().length > 0;
  }
  return true;
}, {
  message: "Custom reason is required when 'Other' is selected.",
  path: ["customReason"],
});

type RejectContentFormValues = z.infer<typeof rejectContentSchema>;

export function RejectContentDialog({
  isOpen,
  onOpenChange,
  contentItem,
  onRejectSubmit,
}: RejectContentDialogProps) {
  const form = useForm<RejectContentFormValues>({
    resolver: zodResolver(rejectContentSchema),
    defaultValues: {
      selectedReason: undefined,
      customReason: "",
    },
  });

  const watchedSelectedReason = form.watch("selectedReason");

  useEffect(() => {
    if (isOpen) {
      form.reset({ selectedReason: undefined, customReason: "" });
    }
  }, [isOpen, form]);

  if (!contentItem) return null;

  const handleSubmit = (data: RejectContentFormValues) => {
    let finalReason = data.selectedReason as string;
    if (data.selectedReason === "Other (Please specify)" && data.customReason) {
      finalReason = data.customReason;
    }
    onRejectSubmit(contentItem.id, finalReason);
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Content: {contentItem.title}</DialogTitle>
          <DialogDescription>
            Select a reason for rejecting this content (ID: {contentItem.id}).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="selectedReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection Reason*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_CONTENT_REJECTION_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedSelectedReason === "Other (Please specify)" && (
              <FormField
                control={form.control}
                name="customReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Other Reason*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the specific reason for rejection..."
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Reject Content"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
