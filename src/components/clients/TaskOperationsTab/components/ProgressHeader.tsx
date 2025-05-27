
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface ProgressHeaderProps {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  isProcessing: boolean;
  processingTime?: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  totalOperations,
  completedOperations,
  failedOperations,
  isProcessing,
  processingTime
}) => {
  const successfulOperations = completedOperations - failedOperations;
  const remainingOperations = totalOperations - completedOperations;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Processing</span>
              {isProcessing && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Active
                </Badge>
              )}
            </div>
            
            {processingTime && (
              <div className="text-sm text-muted-foreground">
                {(processingTime / 1000).toFixed(1)}s elapsed
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{successfulOperations} successful</span>
            </div>
            
            {failedOperations > 0 && (
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{failedOperations} failed</span>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              {remainingOperations} remaining
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
