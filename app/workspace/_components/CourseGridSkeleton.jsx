import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

/** Placeholder grid that matches the shape of a course card grid while loading. */
function CourseGridSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseGridSkeleton;
