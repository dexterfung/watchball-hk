"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, toggle, mounted } = useLanguage();

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={toggle}
      aria-label={lang === "zh" ? "Switch to English" : "切換至中文"}
      className="flex h-9 items-center justify-center rounded-lg px-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
