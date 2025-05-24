
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { WizardStep } from './WizardStep';

interface TaskAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}

const WizardContent: React.FC<{
  onClose: () => void;
  initialClientId?: string;
}> = ({ onClose, initialClientId }) => {
  const { currentStep, selectedAction, resetWizard } = useWizard();

  React.useEffect(() => {
    if (initialClientId) {
      // Set initial client ID if provided
    }
  }, [initialClientId]);

  const handleCancel = () => {
    resetWizard();
    onClose();
  };

  const handleComplete = () => {
    resetWizard();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'action-selection':
        return (
          <WizardStep 
            title="Choose Action"
            description="Select the type of task operation you want to perform"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium mb-2">Copy from Client</h4>
                <p className="text-sm text-muted-foreground">
                  Copy tasks from one client to another
                </p>
                <div className="mt-4">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Available
                  </span>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed">
                <h4 className="font-medium mb-2">Template Assignment</h4>
                <p className="text-sm text-muted-foreground">
                  Assign task templates to clients
                </p>
                <div className="mt-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed">
                <h4 className="font-medium mb-2">Bulk Operations</h4>
                <p className="text-sm text-muted-foreground">
                  Perform bulk task assignments
                </p>
                <div className="mt-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed">
                <h4 className="font-medium mb-2">Template Builder</h4>
                <p className="text-sm text-muted-foreground">
                  Create templates from existing tasks
                </p>
                <div className="mt-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </WizardStep>
        );
      
      default:
        return (
          <WizardStep 
            title="Step Under Development"
            description="This step is currently being implemented"
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground">
                  This step will be implemented in the next phase.
                </p>
              </div>
            </div>
          </WizardStep>
        );
    }
  };

  return (
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
