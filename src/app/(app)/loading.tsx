import { Skeleton } from "@/components/ui/skeleton";

// Skeletons in the shape of the content, not a full-page spinner (docs/08).
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8" aria-busy="true">
      <Skeleton className="h-8 w-1/2 max-w-sm" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 flex flex-col gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </main>
  );
}
