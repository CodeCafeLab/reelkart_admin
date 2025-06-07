import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    // Optionally, you could redirect to a default locale or show a specific error page.
    // For now, using notFound() as a common pattern.
    console.warn(`Invalid locale "${locale}" requested. Falling back to notFound().`);
    notFound();
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}":`, error);
    // Fallback to English messages if a specific locale's messages fail to load,
    // or handle more gracefully (e.g., by redirecting or showing an error message).
    // For simplicity here, we'll try to load English, but ideally, you'd have robust error handling.
    if (locale !== defaultLocale) {
        try {
            console.warn(`Attempting to load default locale messages ("${defaultLocale}") as fallback for "${locale}".`)
            const fallbackMessages = (await import(`../messages/${defaultLocale}.json`)).default;
            return {
                messages: fallbackMessages
            };
        } catch (fallbackError) {
             console.error(`Failed to load default locale messages ("${defaultLocale}") as fallback:`, fallbackError);
             // If default messages also fail, trigger notFound or provide minimal messages.
             notFound(); 
        }
    }
    notFound(); // If it was the default locale that failed, or no fallback desired.
  }
});
