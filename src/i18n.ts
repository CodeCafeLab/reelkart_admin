
'use server';

import * as NextIntlServer from 'next-intl/server'; // Using namespace import
import {notFound} from 'next/navigation';
import {locales} from './i18n-config';

export default NextIntlServer.getRequestConfig(async () => {
  // Obtain the current locale from the dedicated API
  const locale = await NextIntlServer.requestLocale(); // Using namespaced function

  console.log(`[i18n.ts from SRC] Entry: Received locale: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a supported string.
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts from SRC] Invalid or unsupported locale: "${locale}". Calling notFound().`);
    notFound();
    // Fallback return, though notFound() should prevent this.
    // Ensure locale is a string for the return type, even if validation fails.
    return {
      locale: locales.includes(String(locale)) ? String(locale) : 'en', 
      messages: {} 
    };
  }

  console.log(`[i18n.ts from SRC] Valid locale: "${locale}". Proceeding to load messages.`);

  try {
    // Path is relative to this file (src/i18n.ts), needing to go up to project root for 'messages' dir.
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
      locale, 
      messages: {}
    };
  }
});

