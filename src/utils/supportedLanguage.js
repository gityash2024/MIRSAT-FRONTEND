// Mirsat exposes English and Arabic; browser language tags may include a region.
export const supportedLanguage = (language) =>
  String(language || '').trim().toLowerCase().split(/[-_]/)[0] === 'ar' ? 'ar' : 'en';
