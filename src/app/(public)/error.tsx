"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg text-gray-600">無法載入賽程資料</p>
      <p className="mt-2 text-sm text-gray-400">
        請檢查網絡連線後再試
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        重試
      </button>
    </div>
  );
}
