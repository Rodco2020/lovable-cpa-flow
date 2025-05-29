
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, Clock, Copy, Users, Target, ArrowRight, FileText } from 'lucide-react';

interface EnhancedConfirmationStepProps {
  sourceClientId: string;
  targetClientId: string;
  sourceClientName: string;
  targetClientName: string;
  selectedTaskIds: string[];
  onExecute: () => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
}

export const EnhancedConfirmationStep: React.FC<EnhancedConfirmationStepProps> = ({
  sourceClientId,
  targetClientId,
  sourceClientName,
  targetClientName,
  selectedTaskIds,
  onExecute,
  onBack,
  isProcessing
}) => {
  const totalTaskCount = selectedTaskIds.length;
  
  // Calculate estimated task breakdown (simulated for demo)
  const estimatedAdHocTasks = Math.floor(totalTaskCount * 0.6);
  const estimatedRecurringTasks = totalTaskCount - estimatedAdHocTasks;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Confirm Task Copy Operation</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review the operation details before proceeding with the task copy.
          </p>
        </CardHeader>
      </Card>

      {/* Copy Direction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Copy Direction</span>
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
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Copy</span>
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

      {/* Task Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Task Summary</span>
            <Badge variant="secondary" className="ml-2">
              {totalTaskCount} task{totalTaskCount !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to copy <strong>{totalTaskCount}</strong> task{totalTaskCount !== 1 ? 's' : ''} from{' '}
            <strong>{sourceClientName}</strong> to <strong>{targetClientName}</strong>.
          </p>
          
          {/* Task Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Ad-hoc Tasks</span>
              </div>
              <p className="text-lg font-bold text-blue-900 mt-1">{estimatedAdHocTasks}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Recurring Tasks</span>
              </div>
              <p className="text-lg font-bold text-green-900 mt-1">{estimatedRecurringTasks}</p>
            </div>
          </div>

          {/* Processing Time Estimate */}
          {totalTaskCount > 10 && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Large operation detected - this may take a few moments to complete.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Important Operation Details</AlertTitle>
        <AlertDescription className="text-amber-700">
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Task details (name, description, estimated hours) will be copied exactly</li>
            <li>All copied tasks will have "Unscheduled" status initially</li>
            <li>Existing assignments and scheduling will not be copied</li>
            <li>Original tasks in <strong>{sourceClientName}</strong> will remain unchanged</li>
            <li>New tasks will be assigned to <strong>{targetClientName}</strong></li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center space-x-2"
        >
          <span>Back to Task Selection</span>
        </Button>
        
        <Button 
          onClick={onExecute}
          disabled={isProcessing}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2"
        >
          <Copy className="h-4 w-4" />
          <span>{isProcessing ? 'Copying Tasks...' : 'Start Copy Operation'}</span>
        </Button>
      </div>
    </div>
  );
};
