import { Skeleton } from "@/components/ui/skeleton";

// Skeletons in the shape of the content, not a full-page spinner (docs/08).
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10" aria-busy="true">
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </main>
  );
}
