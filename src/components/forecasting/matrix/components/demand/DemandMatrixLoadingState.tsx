
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface DemandMatrixLoadingStateProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixLoadingState: React.FC<DemandMatrixLoadingStateProps> = ({
  className,
  groupingMode
}) => {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Controls Loading */}
        <div className="xl:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Matrix Loading */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading demand matrix ({groupingMode} view)...
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Matrix Grid Skeleton */}
              <div className="space-y-3">
                {/* Header row */}
                <div className="grid grid-cols-13 gap-1">
                  <Skeleton className="h-8 col-span-2" />
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
                
                {/* Data rows */}
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-13 gap-1">
                    <Skeleton className="h-8 col-span-2" />
                    {Array.from({ length: 12 }).map((_, colIndex) => (
                      <Skeleton key={colIndex} className="h-8" />
                    ))}
                  </div>
                ))}
              </div>

              {/* Summary Footer Skeleton */}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 text-center">
                        <Skeleton className="h-4 w-16 mx-auto mb-2" />
                        <Skeleton className="h-6 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
