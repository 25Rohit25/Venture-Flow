import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />;
}

export function StartupCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between gap-4 border-b border-slate-100 animate-pulse">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/6" />
      <Skeleton className="h-5 w-1/6" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
