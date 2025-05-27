
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { ProgressUpdate } from '../types';

interface ProgressTabProps {
  progress?: ProgressUpdate;
  isRunning: boolean;
  isPaused: boolean;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  progress,
  isRunning,
  isPaused
}) => {
  if (!progress) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No operation in progress
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {progress.completed} / {progress.total}</span>
          <span>{progress.percentage.toFixed(1)}%</span>
        </div>
        <Progress value={progress.percentage} className="w-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Current: {progress.currentOperation}</span>
        </div>
        {progress.estimatedTimeRemaining && (
          <div className="text-sm text-muted-foreground">
            Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 1000)}s
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {isPaused ? (
          <Badge variant="secondary">Paused</Badge>
        ) : isRunning ? (
          <Badge variant="default">Running</Badge>
        ) : (
          <Badge variant="outline">Stopped</Badge>
        )}
      </div>
    </div>
  );
};
