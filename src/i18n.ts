
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Log the received locale at the very beginning
  console.log(`[i18n.ts] getRequestConfig called with locale: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a valid string and one of the supported locales
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or unsupported locale: "${locale}". Calling notFound().`);
    notFound();
    // Even though notFound() should terminate rendering, return a compliant structure.
    return {messages: {}};
  }

  // At this point, 'locale' is a validated, known string (e.g., 'en' or 'hi')
  console.log(`[i18n.ts] Proceeding to load messages for valid locale: "${locale}"`);

  try {
    // The path is relative to this file (src/i18n.ts)
    // Using .default as it's common in next-intl examples for messages.
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`[i18n.ts] Successfully loaded messages for locale: "${locale}"`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts] CRITICAL: Failed to import messages for validated locale "${locale}". Path: ./messages/${locale}.json. Error:`, error);
    // If messages can't be loaded for a locale that was otherwise validated,
    // this indicates a deeper issue (e.g., file missing, corrupt, or build misconfiguration).
    notFound();
    // Fallback
    return {messages: {}};
  }
});
