import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              width: index === lines - 1 ? '70%' : '100%',
              height: height || '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Predefined skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="20px" />
            <Skeleton lines={2} height="16px" />
          </div>
          <Skeleton variant="circular" width={64} height={64} />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton width="40%" height="32px" />
        <Skeleton lines={2} height="16px" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
            <Skeleton width="40%" height="16px" className="mb-2" />
            <Skeleton width="60%" height="24px" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton width="30%" height="20px" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton width="50%" height="20px" />
          <Skeleton variant="rounded" height="200px" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 pb-3 border-b border-slate-200">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height="16px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-4 py-3">
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CharitySkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton width="70%" height="16px" />
        <Skeleton lines={2} height="14px" />
      </div>
    </div>
  );
}

export function ScoreEntrySkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="30%" height="20px" />
          <Skeleton width="20%" height="32px" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton width="40%" height="14px" />
              <Skeleton height="40px" />
            </div>
          ))}
        </div>
        
        <Skeleton width="25%" height="40px" className="mx-auto" />
      </div>
    </div>
  );
}
