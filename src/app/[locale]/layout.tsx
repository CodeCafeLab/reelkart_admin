
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string }; // Type definition for params
}

export default async function LocaleLayout({
  children,
  params // Pass the whole params object
}: Readonly<LocaleLayoutProps>) {
  // Await the params object as suggested by the Next.js warning.
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Removed try...catch. If getMessages() fails (e.g., because i18n.ts called notFound()),
  // let Next.js handle the error (e.g., by showing a 404 page).
  const messages = await getMessages(); // getMessages() uses the locale that next-intl determined.

  // Pass the resolved string locale to the provider.
  return (<NextIntlClientProvider messages={messages} locale={locale}>{children}</NextIntlClientProvider>);
}
