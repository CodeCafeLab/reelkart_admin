
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css'; // Adjusted path
// ThemeProvider and Toaster are removed as they are now in the root layout (src/app/layout.tsx)

// Metadata can be defined here if locale-specific titles/descriptions are needed,
// but the global one from src/app/layout.tsx will also apply.
// export const metadata: Metadata = {
// title: 'ReelView Admin', // Example, could be localized
// description: 'Admin Panel for ReelKart',
// };

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
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to get messages in LocaleLayout:", error);
    // Provide a fallback to prevent NextIntlClientProvider from crashing if messages are undefined
    messages = {}; // Or handle more gracefully, e.g., redirect to a default locale or show an error page
  }

  // This layout no longer renders <html>, <head>, or <body> tags.
  // It also does not render ThemeProvider or Toaster.
  // Its main role is to provide the NextIntlClientProvider for its children.
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
