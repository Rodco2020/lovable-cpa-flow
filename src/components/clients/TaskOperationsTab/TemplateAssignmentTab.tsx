
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { useTemplateAssignment } from './hooks/useTemplateAssignment';
import { StepIndicator } from './components/StepIndicator';
import { SelectionStep } from './components/SelectionStep';
import { ConfigurationStep } from './components/ConfigurationStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ProcessingStep } from './components/ProcessingStep';
import { CompleteStep } from './components/CompleteStep';

interface TemplateAssignmentTabProps {
  onClose?: () => void;
}

export const TemplateAssignmentTab: React.FC<TemplateAssignmentTabProps> = ({ onClose }) => {
  const {
    selectedTemplateIds,
    setSelectedTemplateIds,
    availableTemplates,
    isTemplatesLoading,
    selectedClientIds,
    setSelectedClientIds,
    availableClients,
    isClientsLoading,
    assignmentConfig,
    setAssignmentConfig,
    isProcessing,
    progress,
    operationResults,
    error,
    executeAssignment,
    resetOperation,
    validateSelection
  } = useTemplateAssignment();

  const [currentStep, setCurrentStep] = React.useState<'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete'>('selection');

  const handleNext = () => {
    const validationErrors = validateSelection();
    if (validationErrors.length > 0) {
      return;
    }

    switch (currentStep) {
      case 'selection':
        setCurrentStep('configuration');
        break;
      case 'configuration':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleExecuteAssignment();
        break;
    }
  };

  const handleExecuteAssignment = async () => {
    setCurrentStep('processing');
    const success = await executeAssignment();
    if (success) {
      setCurrentStep('complete');
    }
  };

  const handleReset = () => {
    resetOperation();
    setCurrentStep('selection');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'selection':
        return selectedTemplateIds.length > 0 && selectedClientIds.length > 0;
      case 'configuration':
        return true;
      case 'confirmation':
        return !isProcessing;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Template Assignment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <StepIndicator currentStep={currentStep} />

          {currentStep === 'selection' && (
            <SelectionStep
              selectedTemplateIds={selectedTemplateIds}
              setSelectedTemplateIds={setSelectedTemplateIds}
              availableTemplates={availableTemplates}
              isTemplatesLoading={isTemplatesLoading}
              selectedClientIds={selectedClientIds}
              setSelectedClientIds={setSelectedClientIds}
              availableClients={availableClients}
              isClientsLoading={isClientsLoading}
              onNext={handleNext}
              canGoNext={canGoNext()}
            />
          )}

          {currentStep === 'configuration' && (
            <ConfigurationStep
              assignmentConfig={assignmentConfig}
              setAssignmentConfig={setAssignmentConfig}
              onNext={handleNext}
              onBack={() => setCurrentStep('selection')}
            />
          )}

          {currentStep === 'confirmation' && (
            <ConfirmationStep
              selectedTemplateIds={selectedTemplateIds}
              selectedClientIds={selectedClientIds}
              assignmentConfig={assignmentConfig}
              availableTemplates={availableTemplates}
              availableClients={availableClients}
              onExecute={handleExecuteAssignment}
              onBack={() => setCurrentStep('configuration')}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'processing' && (
            <ProcessingStep
              progress={progress}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteStep
              operationResults={{
                success: operationResults.success,
                tasksCreated: operationResults.tasksCreated || operationResults.successfulOperations || 0,
                errors: operationResults.errors || []
              }}
              onReset={handleReset}
              onClose={onClose}
              error={error ? new Error(error) : null}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
