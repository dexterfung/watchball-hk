"use client";

import { useLanguage } from "./LanguageProvider";

export function HeaderTitle() {
  const { lang } = useLanguage();

  return (
    <h1 className="text-lg font-bold text-blue-800 dark:text-blue-300">
      {lang === "zh"
        ? "⚽ 香港足球電視直播時間表"
        : "⚽ HK Football TV Schedule"}
    </h1>
  );
}
