
import React from 'react';
import { ActionSelectionStep } from './ActionSelectionStep';
import { WizardStep } from './WizardStep';
import { CopyFromClientSteps } from './steps/CopyFromClientSteps';
import { TemplateAssignmentSteps } from './steps/TemplateAssignmentSteps';
import { TemplateBuilderSteps } from './steps/TemplateBuilderSteps';
import { WizardStep as WizardStepType, WizardAction } from './types';
import { Client } from '@/types/client';
import { AssignmentConfig } from './AssignmentConfiguration';

interface WizardStepRendererProps {
  currentStep: WizardStepType;
  selectedAction: WizardAction | null;
  initialClientId?: string;
  clients: Client[];
  isClientsLoading: boolean;
  
  // Copy operation props
  copyTargetClientId: string | null;
  copySelectedTaskIds: string[];
  copyStep: string;
  isCopyProcessing: boolean;
  
  // Template assignment props
  selectedTemplateIds: string[];
  setSelectedTemplateIds: (ids: string[]) => void;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  assignmentConfig: AssignmentConfig;
  setAssignmentConfig: (config: AssignmentConfig) => void;
  isAssignmentProcessing: boolean;
  
  // Template builder props
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  
  // Handlers
  handleActionSelect: (action: WizardAction) => void;
  handleClientSelect: (clientId: string) => void;
  handleTemplateAssignmentExecute: () => Promise<void>;
  handleTemplateCreated: (templateData: any) => void;
  handleEnhancedCopyExecute: () => Promise<void>;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
  setCurrentStep: (step: WizardStepType) => void;
  setCopySelectedTaskIds: (ids: string[]) => void;
}

export const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  currentStep,
  selectedAction,
  initialClientId,
  clients,
  isClientsLoading,
  copyTargetClientId,
  copySelectedTaskIds,
  copyStep,
  isCopyProcessing,
  selectedTemplateIds,
  setSelectedTemplateIds,
  selectedClientIds,
  setSelectedClientIds,
  assignmentConfig,
  setAssignmentConfig,
  isAssignmentProcessing,
  selectedTaskIds,
  setSelectedTaskIds,
  handleActionSelect,
  handleClientSelect,
  handleTemplateAssignmentExecute,
  handleTemplateCreated,
  handleEnhancedCopyExecute,
  getSourceClientName,
  getTargetClientName,
  setCurrentStep,
  setCopySelectedTaskIds
}) => {
  switch (currentStep) {
    case 'action-selection':
      return <ActionSelectionStep onActionSelect={handleActionSelect} />;
    
    case 'client-selection':
    case 'task-selection':
    case 'confirmation':
    case 'processing':
    case 'success':
      if (selectedAction === 'copy-from-client') {
        return (
          <CopyFromClientSteps
            currentStep={currentStep}
            initialClientId={initialClientId}
            clients={clients}
            isClientsLoading={isClientsLoading}
            copyTargetClientId={copyTargetClientId}
            copySelectedTaskIds={copySelectedTaskIds}
            copyStep={copyStep}
            onClientSelect={handleClientSelect}
            onTaskSelectionChange={setCopySelectedTaskIds}
            onStepChange={setCurrentStep}
            onCopyExecute={handleEnhancedCopyExecute}
            isCopyProcessing={isCopyProcessing}
            getSourceClientName={getSourceClientName}
            getTargetClientName={getTargetClientName}
          />
        );
      } else if (selectedAction === 'template-assignment') {
        return (
          <TemplateAssignmentSteps
            currentStep={currentStep}
            selectedTemplateIds={selectedTemplateIds}
            setSelectedTemplateIds={setSelectedTemplateIds}
            selectedClientIds={selectedClientIds}
            setSelectedClientIds={setSelectedClientIds}
            assignmentConfig={assignmentConfig}
            setAssignmentConfig={setAssignmentConfig}
            onStepChange={setCurrentStep}
            onExecuteAssignment={handleTemplateAssignmentExecute}
            isAssignmentProcessing={isAssignmentProcessing}
          />
        );
      } else if (selectedAction === 'template-builder') {
        return (
          <TemplateBuilderSteps
            currentStep={currentStep}
            initialClientId={initialClientId}
            clients={clients}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            onStepChange={setCurrentStep}
            onTemplateCreated={handleTemplateCreated}
          />
        );
      }
      break;

    case 'configuration':
      if (selectedAction === 'template-builder') {
        return (
          <TemplateBuilderSteps
            currentStep={currentStep}
            initialClientId={initialClientId}
            clients={clients}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            onStepChange={setCurrentStep}
            onTemplateCreated={handleTemplateCreated}
          />
        );
      }
      return (
        <WizardStep 
          title="Configuration"
          description="Configure your operation settings"
        >
          <div className="text-center py-8 text-muted-foreground">
            Configuration for {selectedAction?.replace('-', ' ')} will be implemented here.
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
