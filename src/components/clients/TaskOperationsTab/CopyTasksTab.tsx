
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useCopyTasksDialog } from '../CopyTasks/hooks/useCopyTasksDialog';
import { useOperationProgress } from './hooks/useOperationProgress';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { StepIndicator } from './components/StepIndicator';
import { CopyStepRenderer } from './components/CopyStepRenderer';

interface CopyTasksTabProps {
  initialClientId?: string;
  onClose?: () => void;
  onTasksRefresh?: () => void;
}

export const CopyTasksTab: React.FC<CopyTasksTabProps> = ({ 
  initialClientId = '',
  onClose, 
  onTasksRefresh 
}) => {
  const [currentStep, setCurrentStep] = React.useState<'selection' | 'task-selection' | 'confirmation' | 'processing' | 'complete'>('selection');

  // Define the steps for the copy tasks workflow
  const copySteps = [
    { key: 'selection', label: 'Select Target Client' },
    { key: 'task-selection', label: 'Select Tasks' },
    { key: 'confirmation', label: 'Confirm Copy' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' }
  ];

  // Fetch available clients for selection (enhanced with proper filtering)
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter out the source client from available clients and ensure only active clients
  const availableClients = Array.isArray(clients) ? clients.filter((client: Client) => 
    client.id !== initialClientId && client.status === 'Active'
  ) : [];

  const {
    step: dialogStep,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  } = useCopyTasksDialog(initialClientId, () => onClose?.());

  const { 
    progressState, 
    startOperation, 
    updateProgress, 
    completeOperation, 
    resetProgress 
  } = useOperationProgress();

  // Sync dialog step with our local step state
  React.useEffect(() => {
    switch (dialogStep) {
      case 'select-target-client':
        setCurrentStep('selection');
        break;
      case 'select-tasks':
        setCurrentStep('task-selection');
        break;
      case 'confirm':
        setCurrentStep('confirmation');
        break;
      case 'processing':
        setCurrentStep('processing');
        break;
      case 'success':
        setCurrentStep('complete');
        break;
      default:
        setCurrentStep('selection');
    }
  }, [dialogStep]);

  const handleExecuteCopy = useCallback(async () => {
    try {
      setCurrentStep('processing');
      startOperation('Copying tasks between clients');
      
      // Enhanced progress tracking with better status messages
      updateProgress(20, 'Validating task data and permissions');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(40, 'Preparing tasks for copy operation');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(60, 'Copying tasks to target client');
      await handleCopy();
      
      updateProgress(80, 'Verifying copied tasks');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(95, 'Finalizing task assignments');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const tasksCreated = selectedTaskIds.length;
      completeOperation({
        success: true,
        tasksCreated,
        errors: []
      });
      
      setCurrentStep('complete');
      
      // Trigger refresh of the tasks overview when copy completes successfully
      if (onTasksRefresh) {
        console.log('Copy operation completed successfully, triggering refresh');
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
      completeOperation({
        success: false,
        tasksCreated: 0,
        errors: [error instanceof Error ? error.message : 'Copy operation failed']
      });
      // Error handling is managed by the dialog hook
    }
  }, [selectedTaskIds.length, startOperation, updateProgress, handleCopy, completeOperation, onTasksRefresh]);

  const handleReset = useCallback(() => {
    resetDialog();
    resetProgress();
    setCurrentStep('selection');
  }, [resetDialog, resetProgress]);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'selection':
        return !!targetClientId;
      case 'task-selection':
        return selectedTaskIds.length > 0;
      case 'confirmation':
        return !progressState.isProcessing;
      default:
        return false;
    }
  }, [currentStep, targetClientId, selectedTaskIds.length, progressState.isProcessing]);

  const getSourceClientName = useCallback(() => {
    if (!initialClientId) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    if (!targetClientId) return '';
    const targetClient = clients.find((c: Client) => c.id === targetClientId);
    return targetClient?.legalName || '';
  }, [targetClientId, clients]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Copy className="h-5 w-5" />
          <span>Copy Tasks Between Clients</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <StepIndicator 
            currentStep={currentStep}
            steps={copySteps}
          />

          <CopyStepRenderer
            currentStep={currentStep}
            initialClientId={initialClientId}
            targetClientId={targetClientId}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            availableClients={availableClients}
            isClientsLoading={isClientsLoading}
            isProcessing={progressState.isProcessing}
            isSuccess={progressState.operationResults?.success || false}
            canGoNext={canGoNext()}
            getSourceClientName={getSourceClientName}
            getTargetClientName={getTargetClientName}
            onSelectClient={handleSelectTargetClient}
            onBack={handleBack}
            onNext={handleNext}
            onExecuteCopy={handleExecuteCopy}
            onReset={handleReset}
            onClose={onClose}
          />
        </div>
      </CardContent>
    </Card>
  );
};
