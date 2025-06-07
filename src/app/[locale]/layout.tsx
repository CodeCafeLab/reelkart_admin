import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css'; // Adjusted path
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: 'ReelView Admin',
  description: 'Admin Panel for ReelKart',
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<LocaleLayoutProps>) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <body className="font-body antialiased">
            {children}
            <Toaster />
          </body>
        </ThemeProvider>
      </NextIntlClientProvider>
    </html>
  );
}
