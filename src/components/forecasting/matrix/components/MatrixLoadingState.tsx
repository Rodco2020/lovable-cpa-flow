
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedMatrixLegend } from '../EnhancedMatrixLegend';
import { RefreshCw } from 'lucide-react';

interface MatrixLoadingStateProps {
  className?: string;
  viewMode: 'hours' | 'percentage';
  skillsLoading: boolean;
}

export const MatrixLoadingState: React.FC<MatrixLoadingStateProps> = ({
  className,
  viewMode,
  skillsLoading
}) => {
  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode={viewMode} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {skillsLoading ? 'Loading skills data...' : 'Loading enhanced matrix data...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
