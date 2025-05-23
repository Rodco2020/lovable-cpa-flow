
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter as ShadcnDialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { DialogStep } from './hooks/useCopyTasksDialog';

interface DialogFooterProps {
  step: DialogStep;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => void;
  handleClose: () => void;
  handleFinish: () => void;
  isNextDisabled: boolean;
  isCopying: boolean;
}

/**
 * Footer component with appropriate buttons based on the current step
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
  step,
  handleBack,
  handleNext,
  handleCopy,
  handleClose,
  handleFinish,
  isNextDisabled,
  isCopying
}) => {
  // Render different buttons based on current step
  const renderButtons = () => {
    switch (step) {
      case 'select-client':
      case 'select-tasks':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <div className="flex space-x-2">
              {step !== 'select-client' && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={isNextDisabled}
              >
                Next
              </Button>
            </div>
          </>
        );
      case 'confirmation':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleCopy}
                disabled={isCopying}
              >
                {isCopying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : 'Copy Tasks'}
              </Button>
            </div>
          </>
        );
      case 'processing':
        return (
          <Button variant="outline" onClick={handleClose} disabled>
            Cancel
          </Button>
        );
      case 'success':
        return (
          <Button onClick={handleFinish}>
            Close
          </Button>
        );
    }
  };
  
  return (
    <ShadcnDialogFooter className="flex justify-between sm:justify-between space-x-2">
      {renderButtons()}
    </ShadcnDialogFooter>
  );
};
