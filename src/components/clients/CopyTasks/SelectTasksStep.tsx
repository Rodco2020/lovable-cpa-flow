
import React from 'react';
import { DialogFooter } from './DialogFooter';
import { CopyTaskStep } from './types';
import { SelectTasksStepHeader } from './SelectTasksStepHeader';
import { SelectTasksStepEnhanced } from './SelectTasksStepEnhanced';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';

interface SelectTasksStepProps {
  clientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  step: CopyTaskStep;
  handleBack: () => void;
  handleNext: () => void;
  isTemplateBuilder?: boolean;
}

export const SelectTasksStep: React.FC<SelectTasksStepProps> = ({
  clientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  step,
  handleBack,
  handleNext,
  isTemplateBuilder = false,
}) => {
  // Get client names for display
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  const getSourceClientName = () => {
    const sourceClient = clients.find((c: Client) => c.id === clientId);
    return sourceClient?.legalName || 'Unknown Client';
  };

  return (
    <div className="space-y-4">
      <SelectTasksStepHeader isTemplateBuilder={isTemplateBuilder} />

      {/* Enhanced Task Selection */}
      <SelectTasksStepEnhanced
        clientId={clientId}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        sourceClientName={getSourceClientName()}
      />

      <DialogFooter
        step={step}
        handleBack={handleBack}
        handleNext={handleNext}
        disableNext={selectedTaskIds.length === 0}
        handleCopy={() => {}}
        isProcessing={false}
        isSuccess={false}
      />
    </div>
  );
};
