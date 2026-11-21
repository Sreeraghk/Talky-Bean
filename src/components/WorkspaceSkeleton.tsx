import React from 'react';

export function WorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-app-bg text-text-main p-4 md:p-8 space-y-6 animate-pulse font-sans max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-app-border/40 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-card-soft border border-app-border" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-card-soft rounded" />
            <div className="w-20 h-3 bg-card-soft/60 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-9 bg-card-soft rounded-xl" />
          <div className="w-9 h-9 bg-card-soft rounded-xl" />
        </div>
      </div>

      {/* Hero / Banner Skeleton */}
      <div className="w-full h-44 rounded-card bg-card-soft border border-app-border/50 p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="w-48 h-6 bg-app-border/60 rounded-lg" />
          <div className="w-3/4 h-4 bg-app-border/40 rounded-lg" />
        </div>
        <div className="flex space-x-3">
          <div className="w-32 h-9 bg-accent/20 rounded-btn" />
          <div className="w-28 h-9 bg-app-border/40 rounded-btn" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 bg-card-bg border border-app-border p-6 rounded-card shadow-sm">
          <div className="w-40 h-5 bg-card-soft rounded" />
          <div className="w-full h-32 bg-card-soft/80 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-card-soft rounded-xl" />
            <div className="h-16 bg-card-soft rounded-xl" />
          </div>
        </div>

        <div className="space-y-4 bg-card-bg border border-app-border p-6 rounded-card shadow-sm">
          <div className="w-32 h-5 bg-card-soft rounded" />
          <div className="space-y-3">
            <div className="h-12 bg-card-soft rounded-xl" />
            <div className="h-12 bg-card-soft rounded-xl" />
            <div className="h-12 bg-card-soft rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
