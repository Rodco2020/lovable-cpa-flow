
import React, { useState, useEffect } from 'react';
import { EnhancedProgressIndicator } from '../../CopyTasks/components/EnhancedProgressIndicator';

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
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [processingSpeed, setProcessingSpeed] = useState(0);

  // Calculate processing speed based on progress changes
  useEffect(() => {
    if (isProcessing && progress > 0) {
      // Simple speed calculation - this would be more sophisticated in a real implementation
      const speed = progress / 10; // Mock calculation
      setProcessingSpeed(speed);
    }
  }, [progress, isProcessing]);

  // Generate mock steps for demonstration
  const generateSteps = () => {
    const baseSteps = [
      { id: 'validation', label: 'Validating task selection' },
      { id: 'preparation', label: 'Preparing copy operation' },
      { id: 'copying', label: 'Copying tasks' },
      { id: 'verification', label: 'Verifying copied tasks' },
      { id: 'completion', label: 'Finalizing operation' }
    ];

    return baseSteps.map((step, index) => {
      const stepProgress = (index + 1) * 20; // Each step is 20%
      let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
      
      if (progress > stepProgress) {
        status = 'completed';
      } else if (progress >= stepProgress - 20 && progress < stepProgress) {
        status = 'processing';
      }

      return {
        ...step,
        status,
        progress: status === 'processing' ? ((progress % 20) / 20) * 100 : undefined,
        estimatedTime: status === 'processing' ? estimatedTimeRemaining : undefined
      };
    });
  };

  const steps = generateSteps();
  const isSuccess = progress >= 100 && !isProcessing;
  const error = null; // No error handling in this mock

  return (
    <div className="space-y-6 p-6">
      <EnhancedProgressIndicator
        totalProgress={progress}
        currentStep={currentOperation}
        steps={steps}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
        error={error}
        estimatedTimeRemaining={estimatedTimeRemaining}
        processingSpeed={processingSpeed}
        showDetailedView={showDetailedView}
        onToggleDetailedView={() => setShowDetailedView(!showDetailedView)}
      />
    </div>
  );
};
