
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Define the list of supported locales and the default locale
export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Validate that the incoming `locale` parameter is a valid string and one of the supported locales.
  // This is the most crucial check.
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or unsupported locale received: "${locale}" (type: ${typeof locale}). Calling notFound().`);
    notFound();
    // Fallback return, though notFound() should prevent this from being reached.
    // This is to satisfy TypeScript's need for a return path if notFound() doesn't throw in a way it recognizes here.
    return {
      messages: {} 
    };
  }

  // If we reach here, 'locale' is a validated string (e.g., 'en' or 'hi').
  console.log(`[i18n.ts] Valid locale: "${locale}". Proceeding to load messages.`);

  try {
    // Dynamically import the messages for the validated locale.
    // The path is relative to this file (src/i18n.ts).
    // For JSON modules with resolveJsonModule: true, the imported module IS the JSON object itself.
    // No .default is needed.
    const messages = await import(`./messages/${locale}.json`);
    console.log(`[i18n.ts] SUCCESS: Imported messages for locale: "${locale}"`);
    return {
      messages
      // You can also define a timezone if needed; otherwise, next-intl defaults to UTC.
      // timeZone: 'America/New_York',
    };
  } catch (error) {
    console.error(`[i18n.ts] FAILED to import messages for locale "${locale}". Path: ./messages/${locale}.json. Error:`, error);
    // If messages can't be loaded for a validated locale, it's also a "not found" scenario.
    notFound();
    // Fallback return in case of import error for a valid locale.
    return {
      messages: {}
    };
  }
});
