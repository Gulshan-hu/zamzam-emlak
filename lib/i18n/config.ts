export type Locale = "az" | "ru" | "en";

export const locales: Locale[] = ["az", "ru", "en"];

export const defaultLocale: Locale = "az";

export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  ru: "Русский",
  en: "English",
};
