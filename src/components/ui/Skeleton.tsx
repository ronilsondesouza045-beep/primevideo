import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-800/80 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
};
