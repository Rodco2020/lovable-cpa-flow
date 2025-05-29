
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Copy, Users, Target, ArrowRight } from 'lucide-react';

interface ProcessingStepProps {
  progress?: number;
  isProcessing: boolean;
  currentOperation?: string;
  sourceClientName?: string;
  targetClientName?: string;
  totalTasks?: number;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ 
  progress = 0,
  isProcessing,
  currentOperation = "Processing operation...",
  sourceClientName,
  targetClientName,
  totalTasks = 0
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
      if (progress >= 100) {
        setIsCompleted(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  // Generate dynamic status message based on progress
  const getStatusMessage = () => {
    if (displayProgress < 20) {
      return "Initializing copy operation...";
    } else if (displayProgress < 40) {
      return "Validating task data and permissions...";
    } else if (displayProgress < 60) {
      return "Copying recurring tasks...";
    } else if (displayProgress < 80) {
      return "Copying ad-hoc tasks...";
    } else if (displayProgress < 100) {
      return "Finalizing and verifying copied tasks...";
    } else {
      return "Copy operation completed successfully!";
    }
  };

  const getIcon = () => {
    if (isCompleted && displayProgress >= 100) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  };
  
  return (
    <div className="space-y-6">
      {/* Operation Context */}
      {(sourceClientName || targetClientName) && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Copy className="h-5 w-5 text-blue-600" />
              <span>Copy Operation in Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {/* Source */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs mb-1">
                    FROM
                  </Badge>
                  <p className="text-sm font-medium">{sourceClientName}</p>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-5 w-5 text-gray-400" />

              {/* Target */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs mb-1">
                    TO
                  </Badge>
                  <p className="text-sm font-medium">{targetClientName}</p>
                </div>
              </div>
            </div>
            
            {totalTasks > 0 && (
              <div className="mt-3 text-center">
                <Badge variant="secondary" className="text-xs">
                  Copying {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Icon */}
            <div className="flex flex-col items-center space-y-4">
              {getIcon()}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {currentOperation || getStatusMessage()}
                </p>
                {!isCompleted && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please don't close this window during the copying process
                  </p>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-3">
              <Progress 
                value={displayProgress} 
                className="w-full h-3"
              />
              
              <div className="flex justify-center">
                <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isCompleted 
                    ? 'bg-green-100 text-green-900' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {Math.round(displayProgress)}% Complete
                </div>
              </div>
            </div>

            {/* Completion Message */}
            {isCompleted && (
              <div className="text-center">
                <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  ✓ Processing completed - advancing to results
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
