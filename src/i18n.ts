
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Log the received locale and its type immediately
  console.log(`[i18n.ts] getRequestConfig called. Received locale: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a valid string and is one of the supported locales
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or undefined locale: "${locale}". Calling notFound().`);
    notFound();
    // If notFound() doesn't immediately terminate, this return should prevent further processing.
    console.warn('[i18n.ts] Execution might continue past notFound() for invalid locale. Returning empty messages to prevent crash.');
    return {messages: {}};
  }

  // At this point, 'locale' is a validated string (e.g., 'en' or 'hi').
  // We can safely use it to construct the import path.
  const messagesPath = `./messages/${locale}.json`;

  console.log(`[i18n.ts] Validated locale: "${locale}". Attempting to import messages dynamically from: "${messagesPath}"`);

  let messages;
  try {
    // Dynamically import the messages for the validated 'locale'
    // For JSON modules with resolveJsonModule: true, you get the object directly, no .default needed.
    messages = await import(`./messages/${locale}.json`);
    console.log(`[i18n.ts] Successfully loaded messages for locale: "${locale}" from path: "${messagesPath}"`);
  } catch (error) {
    console.error(`[i18n.ts] Failed to load messages for locale "${locale}" (attempted path: "${messagesPath}"). Error:`, error);
    notFound();
    console.warn('[i18n.ts] Execution might continue past notFound() after message loading failure. Returning empty messages to prevent crash.');
    return {messages: {}}; // Fallback
  }

  // Safeguard in case messages are unexpectedly undefined after a successful-looking import
  if (!messages) {
    console.error(`[i18n.ts] Messages object is undefined after import for locale "${locale}" (path: "${messagesPath}"). This is unexpected. Calling notFound().`);
    notFound();
    return {messages: {}}; // Fallback
  }

  return {
    messages
  };
});
