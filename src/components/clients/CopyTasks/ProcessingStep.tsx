
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  progress: number;
}

/**
 * Processing step of the copy client tasks dialog
 * Shows a progress bar while tasks are being copied
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({ progress }) => {
  return (
    <div className="py-6 space-y-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Copying tasks, please wait...
        </p>
      </div>
      
      <Progress value={progress} className="w-full" />
      
      <p className="text-sm font-medium">
        {progress}%
      </p>
    </div>
  );
};
