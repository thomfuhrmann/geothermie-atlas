import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { geothermie_de } from "../assets/t9n/geothermie_de";
import { geothermie_en } from "../assets/t9n/geothermie_en";

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: "de",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      de: {
        translation: geothermie_de,
      },
      en: {
        translation: geothermie_en,
      },
    },
  });

export default i18n;
