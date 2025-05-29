
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedSelectTasksStep } from '../../../CopyTasks/EnhancedSelectTasksStep';

interface TaskSelectionStepProps {
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  canGoNext: boolean;
  isProcessing: boolean;
  setSelectedTaskIds: (ids: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const TaskSelectionStep: React.FC<TaskSelectionStepProps> = ({
  sourceClientId,
  targetClientId,
  selectedTaskIds,
  canGoNext,
  isProcessing,
  setSelectedTaskIds,
  onBack,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <EnhancedSelectTasksStep
        sourceClientId={sourceClientId || ''}
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
};
