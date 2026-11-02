import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguage } from "../utils/supportedLanguage";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return supportedLanguage(
      localStorage.getItem("i18nextLng") ||
        i18n.resolvedLanguage ||
        i18n.language,
    );
  });

  useEffect(() => {
    // Set initial language
    i18n.changeLanguage(currentLanguage);
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, i18n]);

  const changeLanguage = (requestedLanguage) => {
    const language = supportedLanguage(requestedLanguage);
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);

    // Update document direction and language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "ar" : "en";
    changeLanguage(newLanguage);
  };

  const isRTL = currentLanguage === "ar";

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isRTL,
    languages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "ar", name: "Arabic", nativeName: "العربية" },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = { children: PropTypes.node };
