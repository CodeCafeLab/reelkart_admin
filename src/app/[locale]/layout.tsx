
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<LocaleLayoutProps>) {
  const currentParams = await Promise.resolve(params);
  const locale = currentParams.locale;

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to get messages in LocaleLayout:", error);
    messages = {};
  }

  return (<NextIntlClientProvider messages={messages} locale={locale}>{children}</NextIntlClientProvider>);
}
