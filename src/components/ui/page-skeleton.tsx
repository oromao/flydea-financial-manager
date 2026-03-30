import { Skeleton } from "@/components/ui/skeleton";

/** Generic cards grid skeleton */
export function CardsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 bg-white/5" />
              <Skeleton className="h-7 w-32 bg-white/5" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
          </div>
          <Skeleton className="h-2 w-full rounded-full bg-white/5" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-xl bg-white/5" />
            <Skeleton className="h-8 w-20 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Table rows skeleton */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-2xl bg-white/5 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 bg-white/5" />
            <Skeleton className="h-3 w-1/5 bg-white/5" />
          </div>
          <Skeleton className="h-5 w-20 bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/** Summary stat cards row */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-3xl p-5 space-y-3">
          <Skeleton className="h-3 w-16 bg-white/5" />
          <Skeleton className="h-8 w-28 bg-white/5" />
          <Skeleton className="h-2 w-10 bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/** Page header skeleton */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 bg-white/5" />
        <Skeleton className="h-4 w-56 bg-white/5" />
      </div>
      <Skeleton className="h-11 w-32 rounded-2xl bg-white/5" />
    </div>
  );
}
