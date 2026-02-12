"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-xl border border-border/50">
        <div className="border-b border-border/50 bg-muted/30 p-3">
          <div className="flex gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="flex items-center gap-8 border-b border-border/30 p-4 last:border-0"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
