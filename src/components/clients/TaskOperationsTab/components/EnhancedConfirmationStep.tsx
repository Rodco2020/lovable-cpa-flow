
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Play, AlertTriangle, CheckCircle2, Clock, FileText, RotateCcw } from 'lucide-react';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { useTaskTypeDetection } from '../../CopyTasks/hooks/useTaskTypeDetection';

interface EnhancedConfirmationStepProps {
  sourceClientId: string;
  targetClientId: string;
  sourceClientName: string;
  targetClientName: string;
  selectedTaskIds: string[];
  onExecute: () => void;
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
  // Use task type detection to categorize selected tasks
  const { data: taskTypeData, isLoading: isDetecting } = useTaskTypeDetection(
    sourceClientId, 
    selectedTaskIds
  );

  // Get task details for display
  const { data: recurringTasks = [] } = useQuery({
    queryKey: ['client', sourceClientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(sourceClientId),
    enabled: !!sourceClientId,
  });

  const { data: adHocTasks = [] } = useQuery({
    queryKey: ['client', sourceClientId, 'adhoc-tasks'],
    queryFn: () => getClientAdHocTasks(sourceClientId),
    enabled: !!sourceClientId,
  });

  // Filter selected tasks for display
  const selectedRecurringTasks = recurringTasks.filter(task => 
    taskTypeData?.recurringTaskIds.includes(task.id)
  );

  const selectedAdHocTasks = adHocTasks.filter(task => 
    taskTypeData?.adHocTaskIds.includes(task.id)
  );

  const recurringCount = taskTypeData?.recurringTaskIds.length || 0;
  const adHocCount = taskTypeData?.adHocTaskIds.length || 0;
  const totalTasks = recurringCount + adHocCount;

  // Calculate estimated hours total
  const totalEstimatedHours = [
    ...selectedRecurringTasks,
    ...selectedAdHocTasks
  ].reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  if (isDetecting) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing selected tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Operation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Copy Operation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Source Client:</span>
              <span className="ml-2">{sourceClientName}</span>
            </div>
            <div>
              <span className="font-medium">Target Client:</span>
              <span className="ml-2">{targetClientName}</span>
            </div>
            <div>
              <span className="font-medium">Total Tasks:</span>
              <span className="ml-2">{totalTasks}</span>
            </div>
            <div>
              <span className="font-medium">Estimated Hours:</span>
              <span className="ml-2">{totalEstimatedHours.toFixed(1)}h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recurring Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Recurring Tasks ({recurringCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recurringCount > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedRecurringTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.recurrencePattern.type} • {task.estimatedHours}h
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recurring tasks selected</p>
            )}
          </CardContent>
        </Card>

        {/* Ad-hoc Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ad-hoc Tasks ({adHocCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adHocCount > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedAdHocTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.category} • {task.estimatedHours}h
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No ad-hoc tasks selected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Important Information */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Copy Operation Details</AlertTitle>
        <AlertDescription className="text-blue-700">
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Task details (name, description, estimated hours) will be copied exactly</li>
            <li>All copied tasks will have status "Unscheduled"</li>
            <li>Recurring tasks will maintain their recurrence patterns</li>
            <li>Original tasks remain unchanged in the source client</li>
            <li>Task assignments and scheduling will not be copied</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={onExecute} disabled={isProcessing} className="flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span>{isProcessing ? 'Copying Tasks...' : `Copy ${totalTasks} Task${totalTasks !== 1 ? 's' : ''}`}</span>
        </Button>
      </div>
    </div>
  );
};
