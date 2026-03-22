"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Language = "zh" | "en";

const LanguageContext = createContext<{
  lang: Language;
  toggle: () => void;
  mounted: boolean;
}>({ lang: "zh", toggle: () => {}, mounted: false });

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en") setLang("en");
    setMounted(true);
  }, []);

  function toggle() {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}
