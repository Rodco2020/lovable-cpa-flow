
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedMatrixLegend } from '../EnhancedMatrixLegend';
import { RefreshCw, Users, TrendingUp } from 'lucide-react';

interface MatrixLoadingStateProps {
  className?: string;
  viewMode: 'hours' | 'percentage';
  skillsLoading: boolean;
  isRefreshing?: boolean;
  selectedClientCount?: number;
}

export const MatrixLoadingState: React.FC<MatrixLoadingStateProps> = ({
  className,
  viewMode,
  skillsLoading,
  isRefreshing = false,
  selectedClientCount = 0
}) => {
  const getLoadingMessage = () => {
    if (skillsLoading) return 'Loading skills data...';
    if (isRefreshing) return 'Updating matrix data...';
    if (selectedClientCount > 0) {
      return `Loading matrix for ${selectedClientCount} selected client${selectedClientCount === 1 ? '' : 's'}...`;
    }
    return 'Loading enhanced matrix data...';
  };

  const getLoadingContext = () => {
    if (selectedClientCount > 0) {
      return `Filtering data for ${selectedClientCount} client${selectedClientCount === 1 ? '' : 's'}`;
    }
    return 'Preparing capacity vs demand analysis';
  };

  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode={viewMode} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col items-center justify-center h-64 space-y-4"
            role="status"
            aria-live="polite"
            aria-label={getLoadingMessage()}
          >
            {/* Enhanced loading animation */}
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              {selectedClientCount > 0 && (
                <Users className="h-5 w-5 text-muted-foreground" />
              )}
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {/* Main loading message */}
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-foreground">
                {getLoadingMessage()}
              </div>
              <div className="text-xs text-muted-foreground">
                {getLoadingContext()}
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
