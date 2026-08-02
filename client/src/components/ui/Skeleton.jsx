export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-32 w-full rounded-xl bg-surface" />
      <div className="mt-4 h-4 w-3/4 rounded bg-surface" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-surface-border px-4 py-4 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-surface" />
      <div className="h-3 flex-1 rounded bg-surface" />
      <div className="h-3 w-20 rounded bg-surface" />
      <div className="h-3 w-16 rounded bg-surface" />
    </div>
  );
}
