
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
    if (currentStep === 'confirmation') return 'Execute';
    if (currentStep === 'success') return 'Finish';
    return 'Next';
  };

  const getPreviousLabel = () => {
    if (customPreviousLabel) return customPreviousLabel;
    return 'Back';
  };

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
        
        {!hideNext && (canGoNext || currentStep === 'success') && (
          <Button 
            onClick={handleNext}
            disabled={isProcessing && currentStep !== 'success'}
          >
            {getNextLabel()}
            {currentStep !== 'success' && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </div>
    </div>
  );
};
