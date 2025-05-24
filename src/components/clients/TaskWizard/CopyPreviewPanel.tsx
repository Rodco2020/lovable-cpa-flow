
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Users, Calendar, Clock } from 'lucide-react';
import { TaskInstance, RecurringTask } from '@/types/task';

interface CopyPreviewPanelProps {
  sourceClientName: string;
  targetClientName: string;
  selectedTasks: (TaskInstance | RecurringTask)[];
  isVisible: boolean;
}

export const CopyPreviewPanel: React.FC<CopyPreviewPanelProps> = ({
  sourceClientName,
  targetClientName,
  selectedTasks,
  isVisible
}) => {
  if (!isVisible) return null;

  const adHocTasks = selectedTasks.filter(task => !('recurrencePattern' in task)) as TaskInstance[];
  const recurringTasks = selectedTasks.filter(task => 'recurrencePattern' in task) as RecurringTask[];
  
  const totalEstimatedHours = selectedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const uniqueSkills = [...new Set(selectedTasks.flatMap(task => task.requiredSkills || []))];
  const priorityCounts = selectedTasks.reduce((acc, task) => {
    const priority = task.priority || 'Medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Copy Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-medium">{sourceClientName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-medium">{targetClientName}</p>
          </div>
        </div>

        {/* Task Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{adHocTasks.length}</p>
            <p className="text-sm text-blue-600">Ad-hoc Tasks</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{recurringTasks.length}</p>
            <p className="text-sm text-purple-600">Recurring Tasks</p>
          </div>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">Total Estimated Hours</span>
            </div>
            <Badge variant="outline">{totalEstimatedHours}h</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {uniqueSkills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {uniqueSkills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{uniqueSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">Priority Distribution</span>
            </div>
            <div className="flex gap-1">
              {Object.entries(priorityCounts).map(([priority, count]) => (
                <Badge 
                  key={priority} 
                  variant={priority === 'High' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {priority}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Important Notes */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Copy Notes:</p>
              <ul className="text-amber-700 space-y-1 text-xs">
                <li>• All tasks will be created as "Unscheduled"</li>
                <li>• Original assignments will not be copied</li>
                <li>• Task details and settings will be preserved</li>
                {recurringTasks.length > 0 && (
                  <li>• Recurring patterns will be maintained</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
