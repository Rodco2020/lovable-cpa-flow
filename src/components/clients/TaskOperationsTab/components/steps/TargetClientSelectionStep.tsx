
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Client } from '@/types/client';
import { SelectTargetClientStep } from '../../../CopyTasks/SelectTargetClientStep';

interface TargetClientSelectionStepProps {
  sourceClientId: string | null;
  targetClientId: string | null;
  availableClients: Client[];
  isClientsLoading: boolean;
  canGoNext: boolean;
  isProcessing: boolean;
  getSourceClientName: () => string;
  onSelectTargetClient: (clientId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const TargetClientSelectionStep: React.FC<TargetClientSelectionStepProps> = ({
  sourceClientId,
  targetClientId,
  availableClients,
  isClientsLoading,
  canGoNext,
  isProcessing,
  getSourceClientName,
  onSelectTargetClient,
  onBack,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <SelectTargetClientStep
        sourceClientId={sourceClientId || ''}
        targetClientId={targetClientId}
        onSelectClient={onSelectTargetClient}
        availableClients={availableClients}
        isLoading={isClientsLoading}
        sourceClientName={getSourceClientName()}
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
};
