
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DemandMatrixErrorStateProps {
  className?: string;
  error: string;
  onRetry: () => void;
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixErrorState: React.FC<DemandMatrixErrorStateProps> = ({
  className,
  error,
  onRetry,
  groupingMode
}) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Demand Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load demand matrix data ({groupingMode} mode): {error}
            </AlertDescription>
          </Alert>
          
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
