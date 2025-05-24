
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizard } from './WizardContext';

interface WizardNavigationProps {
  onCancel?: () => void;
  onComplete?: () => void;
  customNextLabel?: string;
  customPreviousLabel?: string;
  hideNext?: boolean;
  hidePrevious?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onCancel,
  onComplete,
  customNextLabel,
  customPreviousLabel,
  hideNext = false,
  hidePrevious = false
}) => {
  const { 
    currentStep, 
    selectedAction,
    canGoNext, 
    canGoPrevious, 
    goToNextStep, 
    goToPreviousStep, 
    isProcessing,
    isComplete 
  } = useWizard();

  const handleNext = () => {
    if (currentStep === 'success' && onComplete) {
      onComplete();
    } else {
      goToNextStep();
    }
  };

  const getNextLabel = () => {
    if (customNextLabel) return customNextLabel;
    if (currentStep === 'action-selection') return 'Select Action';
    if (currentStep === 'confirmation') return 'Execute';
    if (currentStep === 'success') return 'Finish';
    return 'Next';
  };

  const getPreviousLabel = () => {
    if (customPreviousLabel) return customPreviousLabel;
    return 'Back';
  };

  // For action selection step, we don't show next button since selection triggers navigation
  const shouldShowNext = currentStep !== 'action-selection' && !hideNext && (canGoNext || currentStep === 'success');
  
  // Disable next button on action selection step or when no action is selected for other steps
  const isNextDisabled = isProcessing || 
    (currentStep === 'action-selection') ||
    (currentStep !== 'action-selection' && currentStep !== 'success' && !selectedAction);

  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {!hidePrevious && canGoPrevious && (
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={isProcessing}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {getPreviousLabel()}
          </Button>
        )}
        
        {shouldShowNext && (
          <Button 
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {getNextLabel()}
            {currentStep !== 'success' && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </div>
    </div>
  );
};
