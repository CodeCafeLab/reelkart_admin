
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Package, BarChart2, DollarSign, Star } from "lucide-react";
import { format, parseISO } from 'date-fns';

// Define the Seller type based on the data structure in sellers/page.tsx
type SellerStatus = "Pending" | "Approved" | "Rejected";
interface Seller {
  id: string;
  name: string;
  businessName: string;
  status: SellerStatus;
  joinedDate: string; // "YYYY-MM-DD"
}

interface SellerProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  seller: Seller | null;
}

const statusVariant: Record<SellerStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export function SellerProfileSheet({
  isOpen,
  onOpenChange,
  seller,
}: SellerProfileSheetProps) {
  if (!seller) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      // Try parsing as ISO first (if dates become ISO strings later)
      return format(parseISO(dateString), "PP"); 
    } catch (error) {
      // Fallback for "YYYY-MM-DD" or other parsable formats
      return format(new Date(dateString), "PP");
    }
  };
  
  const currentStatusVariant = statusVariant[seller.status];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={`https://placehold.co/128x128.png?text=${seller.businessName.charAt(0)}`} alt={seller.businessName} data-ai-hint="store logo" />
              <AvatarFallback>{seller.businessName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-semibold">{seller.businessName}</SheetTitle>
              <SheetDescription>
                Contact: {seller.name}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge 
                variant={currentStatusVariant}
                className={seller.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
            >
                {seller.status}
            </Badge>
          </div>
           <p className="text-sm text-muted-foreground">Seller ID: {seller.id}</p>
        </SheetHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Contact Information</h3>
            <Separator className="mb-3"/>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> contact@{seller.businessName.toLowerCase().replace(/\s+/g, '')}.com (mock)</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> +91 98765 XXXXX (mock)</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> 123 Business Rd, Seller City, India (mock)</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Account Details</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><span className="font-medium text-muted-foreground">Joined Date:</span> {formatDate(seller.joinedDate)}</p>
              <p className="flex items-center gap-1"><Package className="h-4 w-4 text-muted-foreground"/> <span className="font-medium text-muted-foreground">Package:</span> Basic (mock)</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Performance (Mock Data)</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p className="flex items-center gap-1"><BarChart2 className="h-4 w-4 text-muted-foreground" /> <span className="font-medium text-muted-foreground">Total Products:</span> 75</p>
                <p className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-muted-foreground" /> <span className="font-medium text-muted-foreground">Total Sales:</span> ₹1,25,000</p>
                <p className="flex items-center gap-1"><Star className="h-4 w-4 text-muted-foreground" /> <span className="font-medium text-muted-foreground">Avg. Rating:</span> 4.5</p>
                <p><span className="font-medium text-muted-foreground">KYC Status:</span> Verified</p>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 pt-6 border-t">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
