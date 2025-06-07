import type { Metadata } from 'next';
import { useTranslations } from 'next-intl'; // For metadata if needed, or use getTranslator for server

// export const metadata: Metadata = { // Metadata can be localized if needed
//   title: 'Login - ReelView Admin', 
// };

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const t = useTranslations('LoginPage'); // For dynamic titles if needed client-side, or getTranslator server-side
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
