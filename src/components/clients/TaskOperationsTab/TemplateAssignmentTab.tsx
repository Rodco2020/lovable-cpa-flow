
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileCheck, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';
import { TemplateBrowser } from '../TaskWizard/TemplateBrowser';
import { MultiClientSelector } from '../TaskWizard/MultiClientSelector';
import { AssignmentConfiguration } from '../TaskWizard/AssignmentConfiguration';
import { OperationProgress } from './OperationProgress';
import { useTemplateAssignment } from './hooks/useTemplateAssignment';

/**
 * Template Assignment Tab - Core functionality for assigning templates to clients
 * Phase 2: Full implementation with progress tracking and error handling
 */
export const TemplateAssignmentTab: React.FC = () => {
  const [step, setStep] = useState<'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete'>('selection');
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

  const canProceedToConfiguration = selectedTemplateIds.length > 0 && selectedClientIds.length > 0;
  const validationErrors = validateSelection();

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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Assign Templates to Clients</h2>
          <div className="flex items-center gap-2">
            <Badge variant={step === 'complete' ? 'default' : 'outline'}>
              Step {step === 'selection' ? '1' : step === 'configuration' ? '2' : step === 'confirmation' ? '3' : step === 'processing' ? '4' : '5'} of 5
            </Badge>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-4 text-sm">
          <StepIndicator 
            label="Selection" 
            isActive={step === 'selection'} 
            isComplete={['configuration', 'confirmation', 'processing', 'complete'].includes(step)}
          />
          <StepIndicator 
            label="Configuration" 
            isActive={step === 'configuration'} 
            isComplete={['confirmation', 'processing', 'complete'].includes(step)}
          />
          <StepIndicator 
            label="Confirmation" 
            isActive={step === 'confirmation'} 
            isComplete={['processing', 'complete'].includes(step)}
          />
          <StepIndicator 
            label="Processing" 
            isActive={step === 'processing'} 
            isComplete={step === 'complete'}
          />
          <StepIndicator 
            label="Complete" 
            isActive={step === 'complete'} 
            isComplete={false}
          />
        </div>
      </div>

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

// Helper Components
interface StepIndicatorProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ label, isActive, isComplete }) => (
  <div className={`flex items-center space-x-2 ${isActive ? 'text-primary' : isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
      isActive ? 'bg-primary text-primary-foreground' : 
      isComplete ? 'bg-green-600 text-white' : 
      'bg-muted text-muted-foreground'
    }`}>
      {isComplete ? <CheckCircle className="h-3 w-3" /> : isActive ? '●' : '○'}
    </div>
    <span className="font-medium">{label}</span>
  </div>
);

// Step Components
interface SelectionStepProps {
  selectedTemplateIds: string[];
  handleTemplateToggle: (id: string) => void;
  availableTemplates: any[];
  isTemplatesLoading: boolean;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  availableClients: any[];
  isClientsLoading: boolean;
  canProceed: boolean;
  validationErrors: string[];
  onNext: () => void;
}

const SelectionStep: React.FC<SelectionStepProps> = ({
  selectedTemplateIds,
  handleTemplateToggle,
  availableTemplates,
  isTemplatesLoading,
  selectedClientIds,
  setSelectedClientIds,
  availableClients,
  isClientsLoading,
  canProceed,
  validationErrors,
  onNext
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Select Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateBrowser
            templates={availableTemplates}
            selectedTemplateIds={selectedTemplateIds}
            onSelectTemplate={handleTemplateToggle}
            isLoading={isTemplatesLoading}
          />
        </CardContent>
      </Card>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiClientSelector
            clients={availableClients}
            selectedClientIds={selectedClientIds}
            onSelectionChange={setSelectedClientIds}
            isLoading={isClientsLoading}
          />
        </CardContent>
      </Card>
    </div>

    {/* Validation Errors */}
    {validationErrors.length > 0 && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    )}

    {/* Selection Summary */}
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Templates: </span>
              <span className="font-medium">{selectedTemplateIds.length} selected</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Clients: </span>
              <span className="font-medium">{selectedClientIds.length} selected</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total Operations: </span>
              <span className="font-medium">{selectedTemplateIds.length * selectedClientIds.length}</span>
            </div>
          </div>
          <Button 
            onClick={onNext} 
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface ConfigurationStepProps {
  assignmentConfig: any;
  setAssignmentConfig: (config: any) => void;
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  availableTemplates: any[];
  onBack: () => void;
  onNext: () => void;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  assignmentConfig,
  setAssignmentConfig,
  selectedTemplateIds,
  selectedClientIds,
  availableTemplates,
  onBack,
  onNext
}) => {
  const selectedTemplates = availableTemplates.filter(t => selectedTemplateIds.includes(t.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentConfiguration
            selectedTemplates={selectedTemplates}
            selectedClientIds={selectedClientIds}
            config={assignmentConfig}
            onConfigChange={setAssignmentConfig}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
        <Button onClick={onNext}>
          Review & Confirm
        </Button>
      </div>
    </div>
  );
};

interface ConfirmationStepProps {
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  assignmentConfig: any;
  availableTemplates: any[];
  availableClients: any[];
  onBack: () => void;
  onExecute: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedTemplateIds,
  selectedClientIds,
  assignmentConfig,
  availableTemplates,
  availableClients,
  onBack,
  onExecute
}) => {
  const selectedTemplates = availableTemplates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedClients = availableClients.filter(c => selectedClientIds.includes(c.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Templates ({selectedTemplates.length})</h4>
            <div className="space-y-1">
              {selectedTemplates.map(template => (
                <div key={template.id} className="text-sm text-muted-foreground">
                  • {template.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Clients ({selectedClients.length})</h4>
            <div className="space-y-1">
              {selectedClients.map(client => (
                <div key={client.id} className="text-sm text-muted-foreground">
                  • {client.legalName}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="text-sm text-muted-foreground">
              <div>• Assignment Type: {assignmentConfig.assignmentType}</div>
              {assignmentConfig.priority && <div>• Priority: {assignmentConfig.priority}</div>}
              {assignmentConfig.dueDate && <div>• Due Date: {assignmentConfig.dueDate.toDateString()}</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Configuration
        </Button>
        <Button onClick={onExecute} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Execute Assignment
        </Button>
      </div>
    </div>
  );
};

interface ProcessingStepProps {
  progress: any;
  isProcessing: boolean;
  operationResults: any;
  error: string | null;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  progress,
  isProcessing,
  operationResults,
  error
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Processing Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <OperationProgress
          progress={progress}
          isProcessing={isProcessing}
          results={operationResults}
          error={error}
        />
      </CardContent>
    </Card>
  </div>
);

interface CompleteStepProps {
  operationResults: any;
  onStartOver: () => void;
}

const CompleteStep: React.FC<CompleteStepProps> = ({
  operationResults,
  onStartOver
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Assignment Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{operationResults?.tasksCreated || 0}</div>
              <div className="text-sm text-muted-foreground">Tasks Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{operationResults?.errors?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>

          {operationResults?.errors?.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {operationResults.errors.slice(0, 3).map((error: string, index: number) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {operationResults.errors.length > 3 && (
                    <div>• ... and {operationResults.errors.length - 3} more errors</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-center">
      <Button onClick={onStartOver}>
        Start New Assignment
      </Button>
    </div>
  </div>
);
