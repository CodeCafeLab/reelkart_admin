
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css';
import {notFound} from 'next/navigation';

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
  const currentLocale = resolvedParams.locale;

  // Ensure locale is a valid string before proceeding.
  // This check might be redundant if middleware handles it, but good for safety.
  if (!currentLocale || typeof currentLocale !== 'string' || currentLocale.trim() === '') {
    console.error(`[LocaleLayout] Invalid or missing locale from params: "${currentLocale}". Calling notFound().`);
    notFound(); // Should be caught by Next.js to render 404
  }

  let messages;
  try {
    // Explicitly pass locale to getMessages, though it should infer.
    // This also ensures that if src/i18n.ts calls notFound(), this try-catch handles it.
    messages = await getMessages({ locale: currentLocale });
  } catch (error) {
    // If getMessages throws (e.g., because src/i18n.ts called notFound(), or the "config not found" error occurs)
    // we ensure notFound() is called here to stop rendering with bad state.
    console.error(`[LocaleLayout] Error calling getMessages for locale "${currentLocale}":`, error);
    notFound();
  }

  // Pass the resolved string locale to the provider.
  return (<NextIntlClientProvider messages={messages} locale={currentLocale}>{children}</NextIntlClientProvider>);
}
