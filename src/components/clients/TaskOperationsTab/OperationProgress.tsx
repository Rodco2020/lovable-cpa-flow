
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { OperationProgress as OperationProgressType } from './hooks/utils/progressTracker';

interface OperationProgressProps {
  progress: OperationProgressType;
  isProcessing: boolean;
}

export const OperationProgress: React.FC<OperationProgressProps> = ({
  progress,
  isProcessing
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress.completed} / {progress.total}</span>
          </div>
          <Progress value={progress.percentage} className="w-full" />
          <div className="text-xs text-muted-foreground">
            {progress.percentage}% complete
            {progress.estimatedTimeRemaining && (
              <span className="ml-2">
                • {Math.ceil(progress.estimatedTimeRemaining / 1000)}s remaining
              </span>
            )}
          </div>
        </div>

        {progress.currentOperation && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Operation</h4>
            <div className="flex items-center space-x-2">
              {getStatusIcon('processing')}
              <span className="text-sm">{progress.currentOperation}</span>
            </div>
          </div>
        )}

        {progress.operations && progress.operations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Operation Details</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {progress.operations.map((operation, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(operation.status)}
                    <span>{operation.description}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(operation.status)}
                  >
                    {operation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {progress.errors && progress.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Errors</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {progress.errors.map((error, index) => (
                <div key={index} className="text-xs p-2 rounded border border-red-200 bg-red-50 text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
