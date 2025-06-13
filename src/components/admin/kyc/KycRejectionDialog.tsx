
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const PREDEFINED_REJECTION_REASONS = [
  "Image Unclear or Illegible",
  "Document Expired",
  "Information Mismatch with Provided Details",
  "Incomplete Submission (Missing Documents/Information)",
  "Document Type Invalid or Not Accepted",
  "Suspected Fraudulent Activity or Tampered Document",
  "Other (Please specify below)",
] as const;

type PredefinedReason = typeof PREDEFINED_REJECTION_REASONS[number];

const rejectionFormSchema = z.object({
  selectedReason: z.enum(PREDEFINED_REJECTION_REASONS, {
    required_error: "Please select a rejection reason.",
  }),
  customReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.selectedReason === "Other (Please specify below)") {
      return data.customReason && data.customReason.trim().length > 0;
    }
    return true;
  },
  {
    message: "Custom reason is required when 'Other' is selected.",
    path: ["customReason"], // Point error to the customReason field
  }
);

type RejectionFormValues = z.infer<typeof rejectionFormSchema>;

interface KycRejectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitReason: (reason: string) => void;
  kycIdToShow?: string;
}

export function KycRejectionDialog({
  isOpen,
  onOpenChange,
  onSubmitReason,
  kycIdToShow,
}: KycRejectionDialogProps) {
  const { toast } = useToast();
  const form = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionFormSchema),
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

  const handleSubmit = (values: RejectionFormValues) => {
    let finalReason = values.selectedReason;
    if (values.selectedReason === "Other (Please specify below)") {
      finalReason = values.customReason || "Other - Reason not specified";
    }
    onSubmitReason(finalReason);
    onOpenChange(false); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject KYC Submission</DialogTitle>
          <DialogDescription>
            Select or provide a reason for rejecting KYC ID: <span className="font-semibold text-primary">{kycIdToShow || "N/A"}</span>.
            This reason will be recorded.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="selectedReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_REJECTION_REASONS.map((reason) => (
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

            {watchedSelectedReason === "Other (Please specify below)" && (
              <FormField
                control={form.control}
                name="customReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Other Reason</FormLabel>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Reason & Reject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
