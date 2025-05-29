
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Client } from '@/types/client';
import { SelectSourceClientStep } from '../../../CopyTasks/SelectSourceClientStep';

interface SourceClientSelectionStepProps {
  sourceClientId: string | null;
  availableClients: Client[];
  isClientsLoading: boolean;
  canGoNext: boolean;
  isProcessing: boolean;
  onSelectSourceClient: (clientId: string) => void;
  onNext: () => void;
  onClose?: () => void;
}

export const SourceClientSelectionStep: React.FC<SourceClientSelectionStepProps> = ({
  sourceClientId,
  availableClients,
  isClientsLoading,
  canGoNext,
  isProcessing,
  onSelectSourceClient,
  onNext,
  onClose
}) => {
  return (
    <div className="space-y-6">
      <SelectSourceClientStep
        sourceClientId={sourceClientId}
        onSelectClient={onSelectSourceClient}
        availableClients={availableClients}
        isLoading={isClientsLoading}
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
};
