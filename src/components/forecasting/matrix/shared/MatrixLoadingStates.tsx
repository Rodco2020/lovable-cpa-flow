import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface MatrixLoadingStateProps {
  title?: string;
  description?: string;
  variant?: 'grid' | 'list' | 'full';
}

/**
 * Matrix Grid Loading State - Phase 5
 */
const MatrixGridLoadingComponent: React.FC<MatrixLoadingStateProps> = ({
  title = "Loading matrix data...",
  description = "Please wait while we fetch your information",
  variant = 'grid'
}) => {
  if (variant === 'full') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Matrix Controls Loading State - Phase 5
 */
const MatrixControlsLoadingComponent: React.FC = () => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading filters...</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Clients skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MatrixGridLoading = memo(MatrixGridLoadingComponent);
export const MatrixControlsLoading = memo(MatrixControlsLoadingComponent);