import { en, type LocaleKeys } from './en';

type LocaleMap = Record<string, Record<LocaleKeys, string>>;

const locales: LocaleMap = {
  en,
};

const currentLocale = process.env.TEST_LOCALE ?? 'en';

export const t = (key: LocaleKeys): string => {
  const catalog = locales[currentLocale];
  if (!catalog) {
    throw new Error(`Unsupported locale: ${currentLocale}`);
  }
  return catalog[key];
};
