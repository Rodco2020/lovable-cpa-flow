
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedMatrixLegend } from '../EnhancedMatrixLegend';

interface MatrixEmptyStateProps {
  className?: string;
  viewMode: 'hours' | 'percentage';
}

export const MatrixEmptyState: React.FC<MatrixEmptyStateProps> = ({
  className,
  viewMode
}) => {
  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode={viewMode} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No matrix data available
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
