
'use server';

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './i18n-config'; // Import locales from the new config file

// Note: defaultLocale is not directly used in this file anymore,
// but it's good practice to have it defined with locales in i18n-config.ts

export default getRequestConfig(async ({locale}: {locale: string}) => {
  console.log(`[i18n.ts from SRC] Entry: Received locale parameter: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a supported string.
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts from SRC] Invalid or unsupported locale: "${locale}". Calling notFound().`);
    notFound();
    // Fallback return, though notFound() should prevent this.
    // It's crucial that notFound() halts execution for async functions.
    // next-intl expects locale and messages to be returned.
    return {
      locale: locales.includes(locale) ? locale : 'en', // a fallback locale
      messages: {} 
    };
  }

  // If we reach here, 'locale' is a validated string (e.g., 'en' or 'hi').
  console.log(`[i18n.ts from SRC] Valid locale: "${locale}". Proceeding to load messages.`);

  try {
    // Path is relative to this file (src/i18n.ts), needing to go up to project root for 'messages' dir.
    // For JSON modules with resolveJsonModule: true, the imported module IS the JSON object.
    // Access .default to get the plain JSON object as per next-intl common patterns.
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log(`[i18n.ts from SRC] SUCCESS: Imported messages for locale: "${locale}"`);
    return {
      locale, // Include the validated locale
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts from SRC] FAILED to import messages for locale "${locale}". Path: ../messages/${locale}.json. Error:`, error);
    notFound();
    // Fallback return in case of import error for a valid locale.
    return {
      locale, // Include the locale that failed
      messages: {}
    };
  }
});

