
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  copyProgress: number;
}

/**
 * Fourth step of the copy client tasks dialog
 * Shows a loading indicator and progress bar
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  copyProgress
}) => {
  return (
    <div className="py-6 space-y-6 text-center">
      <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
      <div>
        <h3 className="text-lg font-medium mb-1">Copying tasks...</h3>
        <p className="text-sm text-gray-500">
          Please wait while your tasks are being copied.
        </p>
      </div>
      <div className="w-full space-y-2">
        <Progress value={copyProgress} className="h-2 w-full" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Processing...</span>
          <span>{copyProgress}%</span>
        </div>
      </div>
    </div>
  );
};
