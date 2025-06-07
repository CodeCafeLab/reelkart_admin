
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
  params // Access params as a whole object first
}: Readonly<LocaleLayoutProps>) {
  // Address: "params should be awaited before using its properties"
  // Await params (even if it's not always a promise, this handles cases where it might be)
  const currentParams = await Promise.resolve(params);
  const locale = currentParams.locale;

  let messages;
  try {
    // This call triggers getRequestConfig which might be failing
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to get messages in LocaleLayout:", error);
    // Provide a fallback to prevent NextIntlClientProvider from crashing if messages are undefined
    messages = {};
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      {/* Pass the resolved locale and messages to NextIntlClientProvider */}
      <NextIntlClientProvider messages={messages} locale={locale}>
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
