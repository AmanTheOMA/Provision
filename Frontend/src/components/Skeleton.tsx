import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/40", className)}
      aria-hidden="true"
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-[4/5] h-[320px] w-full rounded-[25px]" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-card/50 p-5"
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="mt-3 h-8 w-1/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function BoardColumnSkeleton() {
  return (
    <div
      className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <Skeleton className="h-3 w-16" />
      <div className="mt-1 flex flex-col gap-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}
