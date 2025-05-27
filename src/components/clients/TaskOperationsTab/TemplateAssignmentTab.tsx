
import React, { useState } from 'react';
import { ProgressHeader } from './components/ProgressHeader';
import { SelectionStep } from './components/SelectionStep';
import { ConfigurationStep } from './components/ConfigurationStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ProcessingStep } from './components/ProcessingStep';
import { CompleteStep } from './components/CompleteStep';
import { useTemplateAssignment } from './hooks/useTemplateAssignment';

type WizardStep = 'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete';

/**
 * TemplateAssignmentTab Component
 * 
 * Main component for the template assignment workflow.
 * Manages the multi-step wizard for assigning templates to clients.
 * 
 * Features:
 * - Step-by-step wizard interface
 * - Template and client selection
 * - Assignment configuration
 * - Real-time progress tracking
 * - Error handling and validation
 * 
 * Steps:
 * 1. Selection - Choose templates and clients
 * 2. Configuration - Set assignment parameters
 * 3. Confirmation - Review selections
 * 4. Processing - Execute assignments with progress
 * 5. Complete - Show results and cleanup
 */
export const TemplateAssignmentTab: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('selection');
  
  const {
    // Template selection
    selectedTemplateIds,
    setSelectedTemplateIds,
    availableTemplates,
    isTemplatesLoading,
    
    // Client selection
    selectedClientIds,
    setSelectedClientIds,
    availableClients,
    isClientsLoading,
    
    // Configuration
    assignmentConfig,
    setAssignmentConfig,
    
    // Processing
    isProcessing,
    progress,
    operationResults,
    error,
    
    // Actions
    executeAssignment,
    resetOperation,
    validateSelection
  } = useTemplateAssignment();

  // Derived state
  const canProceedToConfiguration = selectedTemplateIds.length > 0 && selectedClientIds.length > 0;
  const validationErrors = validateSelection();

  // Event handlers
  const handleExecuteAssignment = async () => {
    setStep('processing');
    const success = await executeAssignment();
    setStep(success ? 'complete' : 'selection');
  };

  const handleStartOver = () => {
    resetOperation();
    setStep('selection');
  };

  const handleTemplateToggle = (templateId: string) => {
    const newSelection = selectedTemplateIds.includes(templateId)
      ? selectedTemplateIds.filter(id => id !== templateId)
      : [...selectedTemplateIds, templateId];
    setSelectedTemplateIds(newSelection);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <ProgressHeader currentStep={step} />

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {step === 'selection' && (
          <SelectionStep
            selectedTemplateIds={selectedTemplateIds}
            handleTemplateToggle={handleTemplateToggle}
            availableTemplates={availableTemplates}
            isTemplatesLoading={isTemplatesLoading}
            selectedClientIds={selectedClientIds}
            setSelectedClientIds={setSelectedClientIds}
            availableClients={availableClients}
            isClientsLoading={isClientsLoading}
            canProceed={canProceedToConfiguration}
            validationErrors={validationErrors}
            onNext={() => setStep('configuration')}
          />
        )}

        {step === 'configuration' && (
          <ConfigurationStep
            assignmentConfig={assignmentConfig}
            setAssignmentConfig={setAssignmentConfig}
            selectedTemplateIds={selectedTemplateIds}
            selectedClientIds={selectedClientIds}
            availableTemplates={availableTemplates}
            onBack={() => setStep('selection')}
            onNext={() => setStep('confirmation')}
          />
        )}

        {step === 'confirmation' && (
          <ConfirmationStep
            selectedTemplateIds={selectedTemplateIds}
            selectedClientIds={selectedClientIds}
            assignmentConfig={assignmentConfig}
            availableTemplates={availableTemplates}
            availableClients={availableClients}
            onBack={() => setStep('configuration')}
            onExecute={handleExecuteAssignment}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep
            progress={progress}
            isProcessing={isProcessing}
            operationResults={operationResults}
            error={error}
          />
        )}

        {step === 'complete' && (
          <CompleteStep
            operationResults={operationResults}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};
