
import React from 'react';
import { WizardStep } from '../WizardStep';
import { TemplateAssignmentStep } from '../TemplateAssignmentStep';
import { ProcessingStep } from '../../CopyTasks/ProcessingStep';
import { AssignmentConfig } from '../AssignmentConfiguration';
import { WizardStep as WizardStepType } from '../types';

interface TemplateAssignmentStepsProps {
  currentStep: WizardStepType;
  selectedTemplateIds: string[];
  setSelectedTemplateIds: (ids: string[]) => void;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  assignmentConfig: AssignmentConfig;
  setAssignmentConfig: (config: AssignmentConfig) => void;
  onStepChange: (step: WizardStepType) => void;
  onExecuteAssignment: () => Promise<void>;
  isAssignmentProcessing: boolean;
}

export const TemplateAssignmentSteps: React.FC<TemplateAssignmentStepsProps> = ({
  currentStep,
  selectedTemplateIds,
  setSelectedTemplateIds,
  selectedClientIds,
  setSelectedClientIds,
  assignmentConfig,
  setAssignmentConfig,
  onStepChange,
  onExecuteAssignment,
  isAssignmentProcessing
}) => {
  switch (currentStep) {
    case 'task-selection':
      return (
        <TemplateAssignmentStep
          onNext={() => onStepChange('confirmation')}
          onBack={() => onStepChange('action-selection')}
          selectedTemplateIds={selectedTemplateIds}
          setSelectedTemplateIds={setSelectedTemplateIds}
          selectedClientIds={selectedClientIds}
          setSelectedClientIds={setSelectedClientIds}
          assignmentConfig={assignmentConfig}
          setAssignmentConfig={setAssignmentConfig}
        />
      );

    case 'confirmation':
      return (
        <WizardStep 
          title="Confirm Template Assignment"
          description="Review and confirm your template assignments"
        >
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Templates Selected</p>
                  <p className="font-medium">{selectedTemplateIds.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clients Selected</p>
                  <p className="font-medium">{selectedClientIds.length}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => onStepChange('task-selection')}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={onExecuteAssignment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Execute Assignment
              </button>
            </div>
          </div>
        </WizardStep>
      );

    case 'processing':
      return <ProcessingStep progress={isAssignmentProcessing ? 50 : 100} />;

    case 'success':
      return (
        <WizardStep 
          title="Assignment Complete"
          description="Templates have been successfully assigned"
        >
          <div className="text-center py-8 text-green-600">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Successful!</h3>
              <p className="text-gray-600">
                {selectedTemplateIds.length} template(s) assigned to {selectedClientIds.length} client(s)
              </p>
            </div>
          </div>
        </WizardStep>
      );

    default:
      return null;
  }
};
