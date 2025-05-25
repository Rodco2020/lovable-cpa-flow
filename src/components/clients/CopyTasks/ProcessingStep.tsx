
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle } from 'lucide-react';

interface ProcessingStepProps {
  progress: number;
}

/**
 * Processing step of the copy client tasks dialog
 * Shows a progress bar while tasks are being copied
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({ progress }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
      if (progress >= 100) {
        setIsCompleted(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  // Generate dynamic status message based on progress
  const getStatusMessage = () => {
    if (displayProgress < 20) {
      return "Initializing copy process...";
    } else if (displayProgress < 40) {
      return "Preparing tasks for copying...";
    } else if (displayProgress < 60) {
      return "Copying recurring tasks...";
    } else if (displayProgress < 80) {
      return "Copying ad-hoc tasks...";
    } else if (displayProgress < 100) {
      return "Finalizing and verifying...";
    } else {
      return isCompleted ? "Copy completed successfully!" : "Almost complete...";
    }
  };

  const getIcon = () => {
    if (isCompleted && displayProgress >= 100) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  };
  
  return (
    <div className="py-6 space-y-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        {getIcon()}
        <p className="text-sm font-medium">
          {getStatusMessage()}
        </p>
        {!isCompleted && (
          <p className="text-xs text-muted-foreground">
            Please don't close this window during the copying process
          </p>
        )}
      </div>
      
      <Progress value={displayProgress} className="w-full" />
      
      <div className="flex justify-center">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isCompleted 
            ? 'bg-green-100 text-green-900' 
            : 'bg-primary-50 text-primary-900'
        }`}>
          {Math.round(displayProgress)}%
        </div>
      </div>

      {isCompleted && (
        <div className="mt-4 text-xs text-muted-foreground">
          Redirecting to results...
        </div>
      )}
    </div>
  );
};
