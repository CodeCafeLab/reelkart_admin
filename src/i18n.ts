
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Import messages directly
import enMessages from '../messages/en.json';
import hiMessages from '../messages/hi.json';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

// Create a map of all messages
const allMessages = {
  en: enMessages,
  hi: hiMessages
};

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts] getRequestConfig called with locale: ${locale}`);

  if (!locales.includes(locale as any)) {
    console.warn(`[i18n.ts] Invalid locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  // Retrieve messages from the pre-imported map
  const messages = allMessages[locale as keyof typeof allMessages];

  if (!messages) {
    // This case should ideally not be reached if the locale validation above is correct
    // and all supported locales are in allMessages.
    console.error(`[i18n.ts] Critical: Messages for locale "${locale}" not found in pre-imported map.`);
    notFound();
  }

  console.log(`[i18n.ts] Successfully retrieved messages for locale: ${locale} from static map.`);
  return {
    messages
  };
});
