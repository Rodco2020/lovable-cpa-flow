
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading Skeletons Component Collection
 * 
 * Provides consistent loading states across all metrics components
 * Improves perceived performance and user experience
 */

export const MetricCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

export const MetricsPanelSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Primary Metrics Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>

    {/* Detailed Breakdown Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className={`w-full h-${height}`} style={{ height: `${height}px` }} />
    </CardContent>
  </Card>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>

    {/* Key Insights Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>

    {/* Tabs Skeleton */}
    <div className="space-y-4">
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Tab Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const TaskTableSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Table Header Skeleton */}
    <div className="grid grid-cols-6 gap-4 pb-2 border-b">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
    
    {/* Table Rows Skeleton */}
    {[...Array(8)].map((_, i) => (
      <div key={i} className="grid grid-cols-6 gap-4 py-3">
        {[...Array(6)].map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);
