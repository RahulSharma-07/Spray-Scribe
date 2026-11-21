import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-64 bg-white/05 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-white/05 rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/05 border border-white/08 h-32" />
        ))}
      </div>

      {/* Quick Tools Skeleton */}
      <div>
        <div className="h-6 w-32 bg-white/05 rounded-lg mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/05 border border-white/08" />
          ))}
        </div>
      </div>

      {/* Activity Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-6 w-40 bg-white/05 rounded-lg mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/05 border border-white/08" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-white/05 rounded-lg mb-4" />
          <div className="h-64 rounded-2xl bg-white/05 border border-white/08" />
        </div>
      </div>
    </div>
  );
}
