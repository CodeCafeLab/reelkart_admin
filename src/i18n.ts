
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Log the received locale at the very beginning
  console.log(`[i18n.ts] Entry: getRequestConfig received locale: "${locale}" (type: ${typeof locale})`);

  // Step 1: Validate locale.
  // This check is critical. If locale is undefined, null, or not a supported string,
  // we must call notFound() and stop further execution.
  if (!locale || typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Validation FAIL: Locale "${locale}" (type: ${typeof locale}) is invalid or not supported. Supported: ${locales.join(', ')}. Calling notFound().`);
    notFound();
    // Ensure this function absolutely stops here if locale is invalid.
    return {messages: {}};
  }

  // If we reach here, 'locale' is a validated, known string (e.g., 'en' or 'hi')
  console.log(`[i18n.ts] Validation PASS: Proceeding with locale: "${locale}"`);

  try {
    // Dynamically import the messages for the validated locale.
    // Path is relative to this file (src/i18n.ts).
    // For JSON modules with resolveJsonModule: true, the imported module IS the JSON object.
    // No .default is needed.
    const messages = await import(`./messages/${locale}.json`);
    console.log(`[i18n.ts] SUCCESS: Imported messages for locale: "${locale}"`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts] IMPORT FAIL: Could not import messages for locale "${locale}". Path: ./messages/${locale}.json. Error:`, error);
    // If import fails for a validated locale, it's a critical issue (e.g., file missing).
    notFound();
    return {messages: {}}; // Fallback
  }
});
