
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
    // The lines below should ideally not be reached if notFound() terminates execution.
    console.warn('[i18n.ts] Execution continued after notFound() call for invalid locale. This is unexpected.');
    return {messages: {}}; // Fallback in case notFound() doesn't fully halt or for type safety
  }

  // At this point, locale is a validated string, e.g., 'en' or 'hi'
  const validLocale = locale as 'en' | 'hi'; // Type assertion after validation
  console.log(`[i18n.ts] Validated locale: "${validLocale}". Attempting to load messages dynamically.`);

  let messages;
  const importPath = `./messages/${validLocale}.json`;
  console.log(`[i18n.ts] Attempting to import messages from: "${importPath}"`);

  try {
    // Dynamically import the messages for the validated locale
    // For JSON modules with resolveJsonModule: true, you get the object directly.
    messages = await import(`./messages/${validLocale}.json`);
    console.log(`[i18n.ts] Successfully loaded messages for locale: "${validLocale}" from path: "${importPath}"`);
  } catch (error) {
    console.error(`[i18n.ts] Failed to load messages for locale "${validLocale}" from path: "${importPath}". Error:`, error);
    // It's important to trigger a notFound() if messages can't be loaded.
    notFound();
    console.warn('[i18n.ts] Execution continued after notFound() call due to message loading failure.');
    return {messages: {}}; // Fallback
  }

  if (!messages) {
    // This case should ideally be caught by the try-catch or the initial validation,
    // but as a safeguard:
    console.error(`[i18n.ts] Messages object is undefined after import for locale "${validLocale}". This is unexpected. Calling notFound().`);
    notFound();
    return {messages: {}}; // Fallback
  }

  return {
    messages
  };
});
