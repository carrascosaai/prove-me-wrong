export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-line p-5 animate-pulse"
        >
          <div className="h-4 w-24 rounded bg-black/[0.06]" />
          <div className="mt-3 h-5 w-full rounded bg-black/[0.06]" />
          <div className="mt-2 h-5 w-2/3 rounded bg-black/[0.06]" />
          <div className="mt-4 h-3 w-40 rounded bg-black/[0.06]" />
        </div>
      ))}
    </div>
  );
}
