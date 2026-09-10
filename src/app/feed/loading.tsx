import { CardGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="h-9 w-40 rounded bg-white/[0.06] animate-pulse" />
      <div className="mt-8">
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
