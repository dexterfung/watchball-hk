"use client";

import { useLanguage } from "@/components/schedule/LanguageProvider";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {lang === "zh" ? "無法載入賽程資料" : "Failed to load schedule"}
      </p>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        {lang === "zh" ? "請檢查網絡連線後再試" : "Please check your connection and try again"}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {lang === "zh" ? "重試" : "Retry"}
      </button>
    </div>
  );
}
