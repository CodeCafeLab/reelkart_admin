
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Import all message files statically using path aliases
import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

// Create a map of all messages
const allMessages = {
  en: enMessages,
  hi: hiMessages,
};

export default getRequestConfig(async ({locale}) => {
  // Log the received locale and its type immediately
  console.log(`[i18n.ts] getRequestConfig called. Received locale: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a valid string and is one of the supported locales
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or undefined locale: "${locale}". Calling notFound().`);
    notFound(); // This should throw a special error that Next.js handles
    // The lines below should ideally not be reached if notFound() terminates execution.
    console.warn('[i18n.ts] Execution continued after notFound() call for invalid locale. This is unexpected.');
    return {messages: {}}; // Fallback
  }

  // At this point, locale is a validated string, e.g., 'en' or 'hi'
  const validLocale = locale as 'en' | 'hi'; // Type assertion after validation
  console.log(`[i18n.ts] Validated locale: "${validLocale}". Attempting to retrieve messages statically.`);

  const messages = allMessages[validLocale];

  if (!messages) {
    console.error(`[i18n.ts] Messages not found for locale "${validLocale}" in statically imported map. This is unexpected.`);
    notFound();
    console.warn('[i18n.ts] Execution continued after notFound() call due to missing messages in map.');
    return {messages: {}}; // Fallback
  }

  console.log(`[i18n.ts] Successfully retrieved messages for locale: "${validLocale}" from static map.`);

  return {
    messages
  };
});

