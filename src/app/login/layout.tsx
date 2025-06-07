
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - ReelView Admin', 
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
