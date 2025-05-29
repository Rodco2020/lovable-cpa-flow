
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Client } from '@/types/client';
import { ProcessingStep } from './ProcessingStep';
import { CompleteStep } from './CompleteStep';
import { SelectClientStep } from '../../CopyTasks/SelectClientStep';
import { SelectTasksStep } from '../../CopyTasks/SelectTasksStep';
import { EnhancedConfirmationStep } from './EnhancedConfirmationStep';

interface CopyStepRendererProps {
  currentStep: string;
  initialClientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  availableClients: Client[];
  isClientsLoading: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  canGoNext: boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
  onSelectClient: (clientId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onExecuteCopy: () => void;
  onReset: () => void;
  onClose?: () => void;
}

export const CopyStepRenderer: React.FC<CopyStepRendererProps> = ({
  currentStep,
  initialClientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  availableClients,
  isClientsLoading,
  isProcessing,
  isSuccess,
  canGoNext,
  getSourceClientName,
  getTargetClientName,
  onSelectClient,
  onBack,
  onNext,
  onExecuteCopy,
  onReset,
  onClose
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Select Target Client</h3>
              <p className="text-sm text-muted-foreground">
                Choose which client to copy tasks to from <strong>{getSourceClientName()}</strong>
              </p>
            </div>

            <SelectClientStep
              availableClients={availableClients}
              targetClientId={targetClientId || ''}
              setTargetClientId={(id: string) => onSelectClient(id)}
              isLoading={isClientsLoading}
              sourceClientId={initialClientId}
              onSelectClient={onSelectClient}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={onNext} 
                disabled={!canGoNext || isProcessing}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 'task-selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Select Tasks to Copy</h3>
              <p className="text-sm text-muted-foreground">
                Choose which tasks to copy from <strong>{getSourceClientName()}</strong> to <strong>{getTargetClientName()}</strong>
              </p>
            </div>

            <SelectTasksStep
              clientId={initialClientId}
              targetClientId={targetClientId}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
              step="select-tasks"
              handleBack={onBack}
              handleNext={onNext}
            />
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Confirm Copy Operation</h3>
              <p className="text-sm text-muted-foreground">
                Review the details before copying tasks
              </p>
            </div>

            <EnhancedConfirmationStep
              sourceClientId={initialClientId}
              targetClientId={targetClientId || ''}
              sourceClientName={getSourceClientName()}
              targetClientName={getTargetClientName()}
              selectedTaskIds={selectedTaskIds}
              onExecute={onExecuteCopy}
              onBack={onBack}
              isProcessing={isProcessing}
            />
          </div>
        );

      case 'processing':
        return (
          <ProcessingStep
            progress={75}
            isProcessing={isProcessing}
            currentOperation="Copying tasks between clients..."
          />
        );

      case 'complete':
        return (
          <CompleteStep
            operationResults={{
              success: isSuccess,
              tasksCreated: selectedTaskIds.length,
              errors: []
            }}
            onReset={onReset}
            onClose={onClose}
            error={null}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unknown Step</h3>
            <p className="text-muted-foreground">An error occurred in the copy workflow.</p>
            <Button onClick={onReset} className="mt-4">
              Reset
            </Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};
