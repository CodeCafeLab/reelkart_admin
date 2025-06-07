
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Define the list of supported locales and the default locale
export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Log entry and the received locale
  console.log(`[i18n.ts ROOT] Entry: Received locale parameter: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a supported string.
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts ROOT] Invalid or unsupported locale: "${locale}". Calling notFound().`);
    notFound();
    // Fallback return, though notFound() should prevent this.
    // It's crucial that notFound() halts execution for async functions.
    return {
      messages: {} 
    };
  }

  // If we reach here, 'locale' is a validated string (e.g., 'en' or 'hi').
  console.log(`[i18n.ts ROOT] Valid locale: "${locale}". Proceeding to load messages.`);

  try {
    // Dynamically import the messages for the validated locale.
    // The path is relative to this file (i18n.ts at project root).
    // For JSON modules with resolveJsonModule: true, the imported module IS the JSON object.
    // No .default is needed.
    const messages = await import(`./messages/${locale}.json`);
    console.log(`[i18n.ts ROOT] SUCCESS: Imported messages for locale: "${locale}"`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts ROOT] FAILED to import messages for locale "${locale}". Path: ./messages/${locale}.json. Error:`, error);
    notFound();
    // Fallback return in case of import error for a valid locale.
    return {
      messages: {}
    };
  }
});
