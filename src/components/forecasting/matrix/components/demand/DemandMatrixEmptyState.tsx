
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DemandMatrixEmptyStateProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixEmptyState: React.FC<DemandMatrixEmptyStateProps> = ({
  className,
  groupingMode
}) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>No Demand Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No demand data is available for the current filters and {groupingMode} grouping mode. 
              Try adjusting your filters or ensure that clients have active recurring tasks assigned.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
