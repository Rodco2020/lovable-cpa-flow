
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useWizard } from './WizardContext';

export const WizardNavigation: React.FC = () => {
  const {
    currentStep,
    selectedAction,
    canGoNext,
    canGoPrevious,
    goToNextStep,
    goToPreviousStep,
    resetWizard,
    isProcessing
  } = useWizard();

  const getStepNumber = (step: string): number => {
    const steps = ['action-selection', 'client-selection', 'task-selection', 'configuration', 'confirmation', 'processing', 'success'];
    return steps.indexOf(step) + 1;
  };

  const getTotalSteps = (): number => {
    return 7; // Total number of steps
  };

  const getStepTitle = (step: string): string => {
    switch (step) {
      case 'action-selection':
        return 'Select Action';
      case 'client-selection':
        return 'Select Clients';
      case 'task-selection':
        return 'Select Tasks';
      case 'configuration':
        return 'Configuration';
      case 'confirmation':
        return 'Confirmation';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Complete';
      default:
        return 'Unknown Step';
    }
  };

  const shouldShowNext = (): boolean => {
    // Don't show Next button on success or processing steps
    if (currentStep === 'success' || currentStep === 'processing') {
      return false;
    }

    // FIXED: For copy-from-client confirmation, the "Copy Tasks" button handles progression
    // Hide Next button to prevent manual advancement without executing the copy operation
    if (currentStep === 'confirmation' && selectedAction === 'copy-from-client') {
      return false;
    }

    // For template-assignment confirmation, also use action-specific button
    if (currentStep === 'confirmation' && selectedAction === 'template-assignment') {
      return false;
    }
    
    // For action-selection step, only show if an action is selected
    if (currentStep === 'action-selection') {
      return selectedAction !== null;
    }
    
    return canGoNext;
  };

  const shouldShowPrevious = (): boolean => {
    // Don't show Previous button on action-selection, processing, or success steps
    if (currentStep === 'action-selection' || currentStep === 'processing' || currentStep === 'success') {
      return false;
    }
    
    return canGoPrevious;
  };

  return (
    <div className="flex items-center justify-between p-4 border-t bg-muted/10">
      {/* Step indicator */}
      <div className="flex items-center space-x-2">
        <Badge variant="outline">
          Step {getStepNumber(currentStep)} of {getTotalSteps()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {getStepTitle(currentStep)}
        </span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetWizard}
          disabled={isProcessing}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        {shouldShowPrevious() && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousStep}
            disabled={isProcessing}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}

        {shouldShowNext() && (
          <Button
            size="sm"
            onClick={goToNextStep}
            disabled={isProcessing}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
