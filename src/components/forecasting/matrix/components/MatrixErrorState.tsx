
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedMatrixLegend } from '../EnhancedMatrixLegend';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MatrixErrorStateProps {
  className?: string;
  viewMode: 'hours' | 'percentage';
  error?: string | null;
  skillsError?: string | null;
  onRetryMatrix: () => void;
  onRetrySkills?: () => void;
}

export const MatrixErrorState: React.FC<MatrixErrorStateProps> = ({
  className,
  viewMode,
  error,
  skillsError,
  onRetryMatrix,
  onRetrySkills
}) => {
  return (
    <div className={className}>
      <EnhancedMatrixLegend viewMode={viewMode} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error || skillsError}
            </div>
            <div className="flex gap-2">
              <Button onClick={onRetryMatrix} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Matrix
              </Button>
              {skillsError && onRetrySkills && (
                <Button onClick={onRetrySkills} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Skills
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
