export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14 animate-pulse">
      <div className="h-6 w-24 rounded-full bg-black/[0.06]" />
      <div className="mt-4 h-9 w-full rounded bg-black/[0.06]" />
      <div className="mt-2 h-9 w-2/3 rounded bg-black/[0.06]" />
      <div className="mt-8 h-28 rounded-xl bg-black/[0.05]" />
      <div className="mt-8 h-40 rounded-xl bg-black/[0.05]" />
    </div>
  );
}
