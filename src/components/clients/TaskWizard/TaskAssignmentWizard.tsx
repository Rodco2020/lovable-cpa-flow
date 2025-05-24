import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { ActionSelectionStep } from './ActionSelectionStep';
import { WizardStep } from './WizardStep';
import { WizardAction } from './types';
import CopyClientTasksDialog from '../CopyClientTasksDialog';

interface TaskAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}

const WizardContent: React.FC<{
  onClose: () => void;
  initialClientId?: string;
}> = ({ onClose, initialClientId }) => {
  const { 
    currentStep, 
    selectedAction, 
    resetWizard, 
    setCurrentStep,
    targetClientId,
    setTargetClientId 
  } = useWizard();
  
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  React.useEffect(() => {
    if (initialClientId) {
      setTargetClientId(initialClientId);
    }
  }, [initialClientId, setTargetClientId]);

  const handleCancel = () => {
    resetWizard();
    onClose();
  };

  const handleComplete = () => {
    resetWizard();
    onClose();
  };

  const handleActionSelect = (action: WizardAction) => {
    if (action === 'copy-from-client') {
      // Close wizard and open existing copy dialog
      resetWizard();
      onClose();
      setShowCopyDialog(true);
    } else {
      // For other actions, proceed to next step (placeholder for now)
      setCurrentStep('client-selection');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'action-selection':
        return (
          <ActionSelectionStep onActionSelect={handleActionSelect} />
        );
      
      default:
        return (
          <WizardStep 
            title="Step Under Development"
            description="This step is currently being implemented"
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  This step will be implemented in the next phase.
                </p>
                <p className="text-sm text-muted-foreground">
                  Selected Action: <span className="font-medium capitalize">
                    {selectedAction?.replace('-', ' ')}
                  </span>
                </p>
              </div>
            </div>
          </WizardStep>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        <WizardProgressIndicator 
          currentStep={currentStep}
          selectedAction={selectedAction || undefined}
        />
        
        {renderStepContent()}
        
        <WizardNavigation 
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      </div>

      {/* Existing Copy Dialog - maintains backward compatibility */}
      {showCopyDialog && initialClientId && (
        <CopyClientTasksDialog 
          open={showCopyDialog}
          onOpenChange={setShowCopyDialog}
          clientId={initialClientId}
          sourceClientName=""
        />
      )}
    </>
  );
};

export const TaskAssignmentWizard: React.FC<TaskAssignmentWizardProps> = ({
  open,
  onOpenChange,
  initialClientId
}) => {
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <WizardProvider>
          <WizardContent 
            onClose={() => onOpenChange(false)}
            initialClientId={initialClientId}
          />
        </WizardProvider>
      </DialogContent>
    </Dialog>
  );
};
