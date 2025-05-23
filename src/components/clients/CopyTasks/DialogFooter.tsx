
import React from 'react';
import { Button } from '@/components/ui/button';
import { CopyTaskStep, DialogFooterProps } from './types';

/**
 * Dialog footer component that shows the appropriate buttons based on the current step
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
  step,
  handleBack,
  handleNext,
  disableNext = false,
  handleCopy,
  isProcessing,
  isSuccess
}) => {
  if (step === 'processing') {
    return null; // No buttons shown during processing
  }

  if (step === 'success') {
    return (
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={handleBack}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline" 
        onClick={handleBack}
        disabled={step === 'select-client'}
      >
        Back
      </Button>
      
      {step === 'select-tasks' && (
        <Button 
          onClick={handleNext}
          disabled={disableNext}
        >
          Next
        </Button>
      )}
      
      {step === 'confirm' && (
        <Button 
          onClick={handleCopy}
          disabled={isProcessing}
        >
          {isProcessing ? 'Copying...' : 'Copy Tasks'}
        </Button>
      )}
    </div>
  );
};
