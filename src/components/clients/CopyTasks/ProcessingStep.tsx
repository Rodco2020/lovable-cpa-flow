
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle } from 'lucide-react';

interface ProcessingStepProps {
  progress: number;
  onComplete?: () => void;
}

/**
 * Processing step of the copy client tasks dialog
 * Shows a progress bar while tasks are being copied
 * 
 * Simplified to only show progress - step progression is handled by the wizard's state management
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({ progress, onComplete }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
      if (progress >= 100) {
        setIsCompleted(true);
        console.log('ProcessingStep: Copy operation completed (100% progress reached)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  // Call onComplete when operation is finished for notification purposes only
  useEffect(() => {
    if (isCompleted && progress >= 100 && onComplete) {
      console.log('ProcessingStep: Notifying parent of completion via onComplete callback');
      onComplete();
    }
  }, [isCompleted, progress, onComplete]);

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
      return "Copy completed successfully!";
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
          Processing completed - wizard will advance automatically
        </div>
      )}
    </div>
  );
};
