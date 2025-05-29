
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  estimatedTime?: number;
}

interface EnhancedProgressIndicatorProps {
  totalProgress: number;
  currentStep: string;
  steps: ProgressStep[];
  isProcessing: boolean;
  isSuccess: boolean;
  error?: string | null;
  estimatedTimeRemaining?: number;
  processingSpeed?: number; // items per second
  showDetailedView?: boolean;
  onToggleDetailedView?: () => void;
}

export const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  totalProgress,
  currentStep,
  steps,
  isProcessing,
  isSuccess,
  error,
  estimatedTimeRemaining,
  processingSpeed,
  showDetailedView = false,
  onToggleDetailedView
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(totalProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [totalProgress]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOverallStatus = () => {
    if (error) return 'error';
    if (isSuccess) return 'success';
    if (isProcessing) return 'processing';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overallStatus = getOverallStatus();
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const failedSteps = steps.filter(step => step.status === 'failed').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Operation Progress</span>
            <Badge variant="outline" className={getStatusColor(overallStatus)}>
              {overallStatus === 'processing' && 'In Progress'}
              {overallStatus === 'success' && 'Completed'}
              {overallStatus === 'error' && 'Failed'}
              {overallStatus === 'pending' && 'Pending'}
            </Badge>
          </div>
          
          {onToggleDetailedView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetailedView}
              className="flex items-center space-x-1"
              aria-label={`${showDetailedView ? 'Hide' : 'Show'} detailed progress`}
            >
              <span className="text-xs">Details</span>
              {showDetailedView ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span>{Math.round(animatedProgress)}% Complete</span>
          </div>
          <Progress 
            value={animatedProgress} 
            className="h-2"
            aria-label={`Overall progress: ${Math.round(animatedProgress)}%`}
          />
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="font-medium text-lg">{completedSteps}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{failedSteps}</div>
            <div className="text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{steps.length}</div>
            <div className="text-muted-foreground">Total Steps</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">
              {estimatedTimeRemaining ? formatTime(estimatedTimeRemaining) : '–'}
            </div>
            <div className="text-muted-foreground">ETA</div>
          </div>
        </div>

        {/* Current Operation */}
        {isProcessing && currentStep && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="ml-2">
              <strong>Currently:</strong> {currentStep}
              {processingSpeed && (
                <span className="text-muted-foreground ml-2">
                  ({processingSpeed.toFixed(1)} items/sec)
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Step View */}
        {showDetailedView && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium">Step Details</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-2 rounded border text-sm ${
                    step.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                    step.status === 'completed' ? 'bg-green-50 border-green-200' :
                    step.status === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getStepIcon(step)}
                    <span>Step {index + 1}: {step.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {step.progress !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {step.progress}%
                      </span>
                    )}
                    {step.estimatedTime && (
                      <span className="text-xs text-muted-foreground">
                        ~{formatTime(step.estimatedTime)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility Status */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Progress update: {Math.round(animatedProgress)}% complete. 
          {isProcessing && `Currently ${currentStep}.`}
          {isSuccess && 'Operation completed successfully.'}
          {error && `Operation failed: ${error}`}
        </div>
      </CardContent>
    </Card>
  );
};
