
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { OperationProgress } from '../hooks/utils/progressTracker';

interface ProcessingStepProps {
  progress?: OperationProgress;
  isProcessing: boolean;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  progress,
  isProcessing
}) => {
  if (!progress) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Initializing operation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Processing Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we process your bulk assignment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Operation Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.completed} / {progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {progress.percentage.toFixed(1)}% complete
              {progress.estimatedTimeRemaining && (
                <span className="ml-2">
                  • {Math.ceil(progress.estimatedTimeRemaining / 1000)}s remaining
                </span>
              )}
            </div>
          </div>

          {progress.currentOperation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-800">
                Current Operation
              </div>
              <div className="text-sm text-blue-700">
                {progress.currentOperation}
              </div>
            </div>
          )}

          {progress.errors && progress.errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800 mb-2">
                Errors ({progress.errors.length})
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {progress.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-700">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
