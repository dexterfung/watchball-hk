export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Date navigator skeleton */}
      <div className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      {/* Match card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}
