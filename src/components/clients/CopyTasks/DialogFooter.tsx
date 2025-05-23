
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, ClipboardCopy } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface CopyTasksDialogFooterProps {
  step: 'select-client' | 'select-tasks' | 'confirmation' | 'processing' | 'success';
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onCopy: () => void;
  onFinish: () => void;
  isCopying: boolean;
}

/**
 * Footer for the copy tasks dialog with appropriate buttons for each step
 */
export const CopyTasksDialogFooter: React.FC<CopyTasksDialogFooterProps> = ({
  step,
  onBack,
  onNext,
  onClose,
  onCopy,
  onFinish,
  isCopying
}) => {
  if (step === 'processing') {
    return null;
  }
  
  if (step === 'success') {
    return (
      <DialogFooter>
        <Button onClick={onFinish} className="w-full sm:w-auto">
          Done
        </Button>
      </DialogFooter>
    );
  }
  
  if (step === 'confirmation') {
    return (
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mt-2 sm:mt-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onCopy} 
            disabled={isCopying}
          >
            {isCopying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copy Tasks
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    );
  }
  
  // Steps: select-client and select-tasks
  return (
    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
      <div>
        {step !== 'select-client' && (
          <Button variant="outline" onClick={onBack} className="mt-2 sm:mt-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </DialogFooter>
  );
};
