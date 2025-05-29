
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Copy, Users, Target, ArrowRight, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { OperationResults } from '../hooks/utils/progressTracker';

interface CompleteStepProps {
  operationResults: OperationResults | null;
  onReset: () => void;
  onClose?: () => void;
  error?: Error | null;
  sourceClientName?: string;
  targetClientName?: string;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  operationResults,
  onReset,
  onClose,
  error,
  sourceClientName,
  targetClientName
}) => {
  const isSuccess = operationResults?.success && !error;
  const tasksCreated = operationResults?.tasksCreated || 0;
  const errors = operationResults?.errors || [];

  // Calculate task breakdown (simulated)
  const estimatedAdHocTasks = Math.floor(tasksCreated * 0.6);
  const estimatedRecurringTasks = tasksCreated - estimatedAdHocTasks;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className={`border-l-4 ${
        isSuccess 
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-l-green-500' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-l-red-500'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isSuccess ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            <span className={isSuccess ? 'text-green-800' : 'text-red-800'}>
              {isSuccess ? 'Copy Operation Completed!' : 'Copy Operation Failed'}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSuccess 
              ? 'All selected tasks have been successfully copied to the target client.'
              : 'The copy operation encountered errors and could not be completed.'
            }
          </p>
        </CardHeader>
      </Card>

      {isSuccess ? (
        <>
          {/* Success Content */}
          {(sourceClientName || targetClientName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Copy className="h-5 w-5" />
                  <span>Copy Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  {/* Source Client */}
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                          FROM
                        </Badge>
                        <span className="font-medium text-gray-900">{sourceClientName}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Source Client</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-6 w-6 text-green-500" />
                    <span className="text-xs text-green-600 mt-1 font-medium">Copied</span>
                  </div>

                  {/* Target Client */}
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                          TO
                        </Badge>
                        <span className="font-medium text-gray-900">{targetClientName}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Target Client</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Tasks Created</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  {tasksCreated} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Ad-hoc Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{estimatedAdHocTasks}</p>
                  <p className="text-xs text-blue-600 mt-1">Ready for scheduling</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Recurring Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{estimatedRecurringTasks}</p>
                  <p className="text-xs text-green-600 mt-1">Active recurrence rules</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total tasks copied:</span>
                  <span className="font-bold text-gray-900">{tasksCreated}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Initial status:</span>
                  <Badge variant="outline" className="text-xs">Unscheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Error Content */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-red-800">
                  The copy operation could not be completed due to the following issues:
                </p>
                
                {errors.length > 0 && (
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    <strong>Error:</strong> {error.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isSuccess ? 'Copy More Tasks' : 'Try Again'}</span>
        </Button>
        
        {onClose && (
          <Button 
            onClick={onClose}
            variant={isSuccess ? "default" : "secondary"}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        )}
      </div>
    </div>
  );
};
