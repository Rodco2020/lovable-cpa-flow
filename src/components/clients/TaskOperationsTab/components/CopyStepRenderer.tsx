
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Client } from '@/types/client';
import { ProcessingStep } from './ProcessingStep';
import { CompleteStep } from './CompleteStep';
import { SelectSourceClientStep } from '../../CopyTasks/SelectSourceClientStep';
import { SelectTargetClientStep } from '../../CopyTasks/SelectTargetClientStep';
import { EnhancedSelectTasksStep } from '../../CopyTasks/EnhancedSelectTasksStep';
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
            <SelectTargetClientStep
              sourceClientId={initialClientId}
              targetClientId={targetClientId}
              onSelectClient={onSelectClient}
              availableClients={availableClients}
              isLoading={isClientsLoading}
              sourceClientName={getSourceClientName()}
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
            <EnhancedSelectTasksStep
              sourceClientId={initialClientId}
              targetClientId={targetClientId}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={onBack}
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
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

      case 'confirmation':
        return (
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
        );

      case 'processing':
        return (
          <ProcessingStep
            progress={75}
            isProcessing={isProcessing}
            currentOperation="Copying tasks between clients..."
            sourceClientName={getSourceClientName()}
            targetClientName={getTargetClientName()}
            totalTasks={selectedTaskIds.length}
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
            sourceClientName={getSourceClientName()}
            targetClientName={getTargetClientName()}
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
