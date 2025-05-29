
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  progress: number;
  isProcessing: boolean;
  currentOperation?: string;
  estimatedTimeRemaining?: number;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ 
  progress, 
  isProcessing,
  currentOperation = '',
  estimatedTimeRemaining
}) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isProcessing ? 'Processing Operation' : 'Operation Complete'}
        </h3>
        {currentOperation && (
          <p className="text-muted-foreground mb-4">
            {currentOperation}
          </p>
        )}
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <span>~{formatTime(estimatedTimeRemaining)} remaining</span>
          )}
        </div>
      </div>
    </div>
  );
};
