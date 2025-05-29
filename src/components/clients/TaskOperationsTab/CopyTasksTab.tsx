
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useCopyTasksDialog } from '../CopyTasks/hooks/useCopyTasksDialog';
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

  // Fetch available clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter out the source client from available clients
  const availableClients = Array.isArray(clients) ? clients.filter((client: Client) => client.id !== initialClientId) : [];

  const {
    step: dialogStep,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectClient,
    handleBack,
    handleNext,
    handleCopy,
    isProcessing,
    isSuccess,
    resetDialog
  } = useCopyTasksDialog(initialClientId, () => onClose?.());

  // Sync dialog step with our local step state
  React.useEffect(() => {
    switch (dialogStep) {
      case 'select-client':
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

  const handleExecuteCopy = async () => {
    try {
      await handleCopy();
      // Trigger refresh of the tasks overview when copy completes successfully
      if (onTasksRefresh) {
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
      // Error handling is managed by the dialog hook
    }
  };

  const handleReset = () => {
    resetDialog();
    setCurrentStep('selection');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'selection':
        return !!targetClientId;
      case 'task-selection':
        return selectedTaskIds.length > 0;
      case 'confirmation':
        return !isProcessing;
      default:
        return false;
    }
  };

  const getSourceClientName = () => {
    if (!initialClientId) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  };

  const getTargetClientName = () => {
    if (!targetClientId) return '';
    const targetClient = clients.find((c: Client) => c.id === targetClientId);
    return targetClient?.legalName || '';
  };

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
            isProcessing={isProcessing}
            isSuccess={isSuccess}
            canGoNext={canGoNext()}
            getSourceClientName={getSourceClientName}
            getTargetClientName={getTargetClientName}
            onSelectClient={handleSelectClient}
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
