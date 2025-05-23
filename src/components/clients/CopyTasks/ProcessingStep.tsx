
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
  // Generate dynamic status message based on progress
  const getStatusMessage = () => {
    if (progress < 20) {
      return "Initializing copy process...";
    } else if (progress < 40) {
      return "Preparing tasks for copying...";
    } else if (progress < 60) {
      return "Copying recurring tasks...";
    } else if (progress < 80) {
      return "Copying ad-hoc tasks...";
    } else if (progress < 95) {
      return "Finalizing and verifying...";
    } else {
      return "Almost complete...";
    }
  };
  
  return (
    <div className="py-6 space-y-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">
          {getStatusMessage()}
        </p>
        <p className="text-xs text-muted-foreground">
          Please don't close this window during the copying process
        </p>
      </div>
      
      <Progress value={progress} className="w-full" />
      
      <div className="flex justify-center">
        <div className="bg-primary-50 px-3 py-1 rounded-full text-sm font-medium text-primary-900">
          {progress}%
        </div>
      </div>
    </div>
  );
};
