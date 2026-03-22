import type { Language } from "./LanguageProvider";

interface EmptyStateProps {
  message?: string;
  onClearFilters?: () => void;
  lang: Language;
}

export function EmptyState({
  message,
  onClearFilters,
  lang,
}: EmptyStateProps) {
  const defaultMessage =
    lang === "zh" ? "今日暫無賽事直播" : "No matches today";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg text-gray-500 dark:text-gray-400">
        {message ?? defaultMessage}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          {lang === "zh" ? "清除篩選" : "Clear filters"}
        </button>
      )}
    </div>
  );
}
