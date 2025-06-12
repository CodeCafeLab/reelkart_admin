
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
import type { ContentItem, FlagType } from "@/types/content-moderation";
import { FLAG_TYPES } from "@/types/content-moderation";

interface FlagContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem | null;
  onFlagSubmit: (contentId: string, flagType: FlagType, reason?: string) => void;
}

const flagContentSchema = z.object({
  flagType: z.enum(FLAG_TYPES, { required_error: "Please select a flag type." }),
  reason: z.string().optional(),
});

type FlagContentFormValues = z.infer<typeof flagContentSchema>;

export function FlagContentDialog({
  isOpen,
  onOpenChange,
  contentItem,
  onFlagSubmit,
}: FlagContentDialogProps) {
  const form = useForm<FlagContentFormValues>({
    resolver: zodResolver(flagContentSchema),
    defaultValues: {
      flagType: undefined, 
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ flagType: undefined, reason: "" });
    }
  }, [isOpen, form]);

  if (!contentItem) return null;

  const handleSubmit = (data: FlagContentFormValues) => {
    onFlagSubmit(contentItem.id, data.flagType, data.reason);
    onOpenChange(false); // Close dialog after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Flag Content: {contentItem.title}</DialogTitle>
          <DialogDescription>
            Select a reason for flagging this content (ID: {contentItem.id}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <Controller
            name="flagType"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Label htmlFor="flag-type">Flag Type*</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="flag-type">
                    <SelectValue placeholder="Select a flag type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FLAG_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <div className="space-y-1">
            <Label htmlFor="flag-reason">Reason/Notes (Optional)</Label>
            <Textarea
              id="flag-reason"
              placeholder="Provide additional details if necessary..."
              {...form.register("reason")}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Flag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
