
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Users, Copy, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SelectTasksStep } from '../../CopyTasks/SelectTasksStep';
import { ConfirmationStep } from '../../CopyTasks/ConfirmationStep';
import { ProcessingStep } from '../../CopyTasks/ProcessingStep';
import { SuccessStep } from '../../CopyTasks/SuccessStep';
import { Client } from '@/types/client';

interface CopyStepRendererProps {
  currentStep: 'selection' | 'task-selection' | 'confirmation' | 'processing' | 'complete';
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
  onExecuteCopy: () => Promise<void>;
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
  switch (currentStep) {
    case 'selection':
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select Target Client</h3>
            <p className="text-muted-foreground mb-6">
              Choose which client to copy tasks to from <strong>{getSourceClientName()}</strong>
            </p>
          </div>

          {isClientsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading clients...</p>
            </div>
          ) : availableClients.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No other clients available for copying tasks.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {availableClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    targetClientId === client.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectClient(client.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{client.legalName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.industry} • {client.status}
                      </p>
                    </div>
                    {targetClientId === client.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={onNext}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              Select Tasks <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );

    case 'task-selection':
      return targetClientId ? (
        <SelectTasksStep 
          clientId={initialClientId}
          targetClientId={targetClientId}
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          step="select-tasks"
          handleBack={onBack}
          handleNext={onNext}
        />
      ) : null;

    case 'confirmation':
      return targetClientId ? (
        <ConfirmationStep 
          sourceClientId={initialClientId}
          targetClientId={targetClientId}
          sourceClientName={getSourceClientName()}
          targetClientName={getTargetClientName()}
          selectedAdHocTaskCount={Math.floor(selectedTaskIds.length * 0.6)}
          selectedRecurringTaskCount={Math.ceil(selectedTaskIds.length * 0.4)}
          selectedCount={selectedTaskIds.length}
          step="confirm"
          handleBack={onBack}
          handleCopy={onExecuteCopy}
          isProcessing={isProcessing}
        />
      ) : null;

    case 'processing':
      return (
        <ProcessingStep progress={75} />
      );

    case 'complete':
      return (
        <div className="space-y-6">
          <SuccessStep 
            sourceClientName={getSourceClientName()}
            targetClientName={getTargetClientName()}
            adHocTasksCount={Math.floor(selectedTaskIds.length * 0.6)}
            recurringTasksCount={Math.ceil(selectedTaskIds.length * 0.4)}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onReset}>
              Copy More Tasks
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Unknown step</p>
        </div>
      );
  }
};
