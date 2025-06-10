
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string; // For styling the Card element itself
  href?: string;      // Optional: if provided, card becomes a link
}

export function StatCard({ title, value, icon: Icon, description, className, href }: StatCardProps) {
  const cardContent = (
    <Card className={cn("flex flex-col h-full", className)}> {/* Ensure card fills height for proper link clicking */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow"> {/* Allow content to grow if needed */}
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-lg transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
