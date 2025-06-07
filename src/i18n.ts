
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async (params: {locale: string}) => {
  // The 'params' object from getRequestConfig contains the 'locale'.
  const currentLocale = params.locale;

  console.log(`[i18n.ts] Received locale parameter: "${currentLocale}" (type: ${typeof currentLocale})`);

  // Strict validation:
  // 1. Check if currentLocale is a string.
  // 2. Check if currentLocale is included in the supported locales array.
  if (typeof currentLocale !== 'string' || !locales.includes(currentLocale)) {
    console.error(`[i18n.ts] Invalid or unsupported locale: "${currentLocale}". Calling notFound(). Supported locales: ${locales.join(', ')}`);
    notFound();
    // According to next-intl and Next.js docs, notFound() should throw an error
    // that Next.js handles to render the 404 page, preventing further execution here.
    // However, to satisfy TypeScript's need for a return value and as a fallback:
    return {messages: {}};
  }

  // If we reach here, currentLocale is a validated, known string (e.g., 'en' or 'hi')
  console.log(`[i18n.ts] Locale "${currentLocale}" is valid. Attempting to import messages.`);

  try {
    // Dynamically import the messages for the validated locale.
    // The path is relative to this file (src/i18n.ts).
    // For JSON modules (with resolveJsonModule: true in tsconfig.json),
    // the imported module IS the JSON object itself, no .default is needed.
    const messages = await import(`./messages/${currentLocale}.json`);
    console.log(`[i18n.ts] Successfully imported messages for locale: "${currentLocale}"`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts] IMPORT FAIL: Could not import messages for locale "${currentLocale}". Path: ./messages/${currentLocale}.json. Error:`, error);
    // If the import fails for a _validated_ locale (e.g., file is missing or malformed),
    // this is also a "not found" scenario for the messages.
    notFound();
    return {messages: {}}; // Fallback for type safety.
  }
});

