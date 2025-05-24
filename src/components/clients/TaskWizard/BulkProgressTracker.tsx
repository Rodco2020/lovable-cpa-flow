
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Timer
} from 'lucide-react';
import { ProgressUpdate } from './types';

interface BulkProgressTrackerProps {
  progress: ProgressUpdate;
  isRunning: boolean;
  isPaused: boolean;
  startTime?: number;
}

export const BulkProgressTracker: React.FC<BulkProgressTrackerProps> = ({
  progress,
  isRunning,
  isPaused,
  startTime
}) => {
  const elapsedTime = startTime ? Date.now() - startTime : 0;
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const operationsPerSecond = elapsedTime > 0 ? (progress.completed / (elapsedTime / 1000)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Progress Tracker</span>
          {isPaused ? (
            <Badge variant="secondary">Paused</Badge>
          ) : isRunning ? (
            <Badge variant="default">Running</Badge>
          ) : (
            <Badge variant="outline">Stopped</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress.completed} / {progress.total} ({progress.percentage.toFixed(1)}%)</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
        </div>

        {/* Current Operation */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Current Operation</span>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            {progress.currentOperation}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Elapsed Time</span>
            </div>
            <div className="text-lg font-semibold">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span>Est. Remaining</span>
            </div>
            <div className="text-lg font-semibold">
              {progress.estimatedTimeRemaining ? formatTime(progress.estimatedTimeRemaining) : 'Calculating...'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Operations/sec</span>
            </div>
            <div className="text-lg font-semibold">
              {operationsPerSecond.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>Remaining</span>
            </div>
            <div className="text-lg font-semibold">
              {progress.total - progress.completed}
            </div>
          </div>
        </div>

        {/* Progress Segments */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Progress Breakdown</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Completed</span>
              </span>
              <span>{progress.completed}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>In Progress</span>
              </span>
              <span>1</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span>Pending</span>
              </span>
              <span>{progress.total - progress.completed - 1}</span>
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              Operation running smoothly
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Average processing time: {operationsPerSecond > 0 ? (1000 / operationsPerSecond).toFixed(0) : 0}ms per operation
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
