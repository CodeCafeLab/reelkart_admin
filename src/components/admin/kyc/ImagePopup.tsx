
"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string;
}

export function ImagePopup({ isOpen, onOpenChange, imageUrl }: ImagePopupProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-2 sm:p-4 max-w-3xl w-[90vw] h-auto max-h-[90vh] flex flex-col items-center justify-center bg-background shadow-2xl rounded-lg">
        <div className="relative w-full h-auto aspect-video max-h-[80vh]">
          <Image
            src={imageUrl}
            alt="KYC Document View"
            layout="fill"
            objectFit="contain"
            className="rounded"
            data-ai-hint="document image"
          />
        </div>
        <DialogClose asChild className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/50 hover:bg-background/80">
            <X className="h-5 w-5" />
            <span className="sr-only">Close image view</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
