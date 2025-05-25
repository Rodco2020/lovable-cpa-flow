
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizardProvider } from './WizardContext';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { WizardStepRenderer } from './WizardStepRenderer';
import { useTaskAssignmentWizard } from './hooks/useTaskAssignmentWizard';

interface TaskAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}

/**
 * Task Assignment Wizard Component
 * 
 * A comprehensive wizard for managing task operations including:
 * - Copy tasks from one client to another
 * - Assign templates to clients
 * - Build new templates from existing tasks
 * - Bulk operations across multiple clients
 * 
 * The wizard provides a step-by-step interface with progress tracking,
 * navigation controls, and proper state management throughout the process.
 */
const WizardContent: React.FC<{
  onClose: () => void;
  initialClientId?: string;
}> = ({ onClose, initialClientId }) => {
  const wizardState = useTaskAssignmentWizard(initialClientId, onClose);

  return (
    <div className="space-y-6">
      <WizardProgressIndicator 
        currentStep={wizardState.currentStep}
        selectedAction={wizardState.selectedAction || undefined}
      />
      
      <WizardStepRenderer
        currentStep={wizardState.currentStep}
        selectedAction={wizardState.selectedAction}
        initialClientId={initialClientId}
        clients={wizardState.clients}
        isClientsLoading={wizardState.isClientsLoading}
        copyTargetClientId={wizardState.copyTargetClientId}
        copySelectedTaskIds={wizardState.copySelectedTaskIds}
        copyStep={wizardState.copyStep}
        isCopyProcessing={wizardState.isCopyProcessing}
        selectedTemplateIds={wizardState.selectedTemplateIds}
        setSelectedTemplateIds={wizardState.setSelectedTemplateIds}
        selectedClientIds={wizardState.selectedClientIds}
        setSelectedClientIds={wizardState.setSelectedClientIds}
        assignmentConfig={wizardState.assignmentConfig}
        setAssignmentConfig={wizardState.setAssignmentConfig}
        isAssignmentProcessing={wizardState.isAssignmentProcessing}
        selectedTaskIds={wizardState.selectedTaskIds}
        setSelectedTaskIds={wizardState.setSelectedTaskIds}
        handleActionSelect={wizardState.handleActionSelect}
        handleClientSelect={wizardState.handleClientSelect}
        handleTemplateAssignmentExecute={wizardState.handleTemplateAssignmentExecute}
        handleTemplateCreated={wizardState.handleTemplateCreated}
        handleEnhancedCopyExecute={wizardState.handleEnhancedCopyExecute}
        getSourceClientName={wizardState.getSourceClientName}
        getTargetClientName={wizardState.getTargetClientName}
        setCurrentStep={wizardState.setCurrentStep}
        setCopySelectedTaskIds={wizardState.setCopySelectedTaskIds}
      />
      
      <WizardNavigation />
    </div>
  );
};

/**
 * Main Task Assignment Wizard Dialog
 * 
 * Provides a modal interface for the task assignment wizard with proper
 * context management and state isolation.
 */
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
