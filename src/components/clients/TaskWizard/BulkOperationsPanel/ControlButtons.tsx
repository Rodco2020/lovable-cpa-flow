
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

interface ControlButtonsProps {
  canStart: boolean;
  isRunning: boolean;
  isPaused: boolean;
  onStartOperation: () => void;
  onPauseOperation: () => void;
  onStopOperation: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  canStart,
  isRunning,
  isPaused,
  onStartOperation,
  onPauseOperation,
  onStopOperation
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        onClick={onStartOperation}
        disabled={!canStart}
        className="flex-1"
      >
        <Play className="h-4 w-4 mr-2" />
        Start Operations
      </Button>
      
      {isRunning && (
        <>
          <Button
            variant="outline"
            onClick={isPaused ? onStartOperation : onPauseOperation}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            onClick={onStopOperation}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
