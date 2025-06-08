
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
        {/* Controls loading */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Matrix loading */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Loading Demand Matrix...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex space-x-2">
                    {Array.from({ length: 13 }).map((_, j) => (
                      <Skeleton key={j} className="h-16 w-24" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
