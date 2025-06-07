
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Define the list of supported locales and the default locale
export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Log the received locale immediately after destructuring
  console.log(`[i18n.ts] getRequestConfig called. Destructured locale: "${locale}", Type: ${typeof locale}`);

  // Validate that the locale is a string and is one of the supported locales.
  // This check is crucial.
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or unsupported locale: "${locale}". Type: ${typeof locale}. Calling notFound().`);
    notFound(); // This should ideally stop execution by throwing a special error Next.js handles.

    // Explicitly return a fallback message structure to ensure the function exits
    // if notFound() doesn't halt execution in this async context.
    // This is a critical safeguard.
    return {
      messages: {
        // Provide a minimal fallback structure or leave empty if preferred
        ErrorMessages: { INVALID_LOCALE: "The requested locale is not supported." }
      },
      timeZone: 'Etc/UTC' // Provide a default timezone
    };
  }

  // If we reach here, 'locale' is a validated string (e.g., 'en' or 'hi').
  console.log(`[i18n.ts] Valid locale: "${locale}". Proceeding to load messages.`);

  try {
    // Dynamically import the messages for the validated locale.
    // The path is relative to this file (src/i18n.ts).
    // For JSON modules with resolveJsonModule: true, the imported module IS the JSON object.
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
      messages: {
        ErrorMessages: { IMPORT_FAILED: "Failed to load messages for the locale." }
      },
      timeZone: 'Etc/UTC'
    };
  }
});
