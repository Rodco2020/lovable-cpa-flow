
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock,
  TrendingUp
} from 'lucide-react';

interface OperationProgressProps {
  progress: {
    completed: number;
    total: number;
    currentOperation?: string;
    percentage: number;
    estimatedTimeRemaining?: number;
  };
  isProcessing: boolean;
  results?: {
    tasksCreated: number;
    errors: string[];
    success: boolean;
  };
  error: string | null;
}

export const OperationProgress: React.FC<OperationProgressProps> = ({
  progress,
  isProcessing,
  results,
  error
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : progress.percentage === 100 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isProcessing ? 'Processing...' : progress.percentage === 100 ? 'Complete' : 'Ready'}
            </span>
          </div>
          <Badge variant="outline">
            {progress.completed} / {progress.total}
          </Badge>
        </div>

        <Progress value={progress.percentage} className="h-2" />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{progress.percentage.toFixed(1)}% complete</span>
          {progress.estimatedTimeRemaining && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(progress.estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
      </div>

      {/* Current Operation */}
      {progress.currentOperation && isProcessing && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <span className="text-muted-foreground">Current: </span>
            <span className="font-medium">{progress.currentOperation}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      {results && !isProcessing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Success</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{results.tasksCreated}</div>
              <div className="text-xs text-green-700">Tasks created</div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Errors</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{results.errors.length}</div>
              <div className="text-xs text-red-700">Failed operations</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate:</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-medium">
                  {((results.tasksCreated / (results.tasksCreated + results.errors.length)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {results.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium mb-2">Errors encountered:</div>
                  {results.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">• {error}</div>
                  ))}
                  {results.errors.length > 5 && (
                    <div className="text-sm">• ... and {results.errors.length - 5} more errors</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
