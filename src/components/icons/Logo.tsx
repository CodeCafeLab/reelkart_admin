import { Shield } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export function Logo(props: LucideProps) {
  return (
    <div className="flex items-center gap-2">
      <Shield className="h-8 w-8 text-primary" {...props} />
      <span className="text-2xl font-bold text-foreground font-headline">ReelView</span>
    </div>
  );
}
