import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts] getRequestConfig called with locale: ${locale}`);

  if (!locales.includes(locale as any)) {
    console.warn(`[i18n.ts] Invalid locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  try {
    console.log(`[i18n.ts] Attempting to import messages for locale: ${locale}`);
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log(`[i18n.ts] Successfully imported messages for locale: ${locale}`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts] Failed to load messages for locale "${locale}":`, error);
    notFound();
  }
});
