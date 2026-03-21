interface EmptyStateProps {
  message?: string;
  onClearFilters?: () => void;
}

export function EmptyState({
  message = "今日暫無賽事直播",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg text-gray-500">{message}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          清除篩選
        </button>
      )}
    </div>
  );
}
