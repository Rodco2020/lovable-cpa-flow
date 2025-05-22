
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoScheduleResult } from "@/services/autoSchedulerService";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  CheckCircle, AlertTriangle, Info, Calendar, Clock, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AutoScheduleResultsProps {
  result: AutoScheduleResult | null;
  onClose: () => void;
}

const AutoScheduleResults: React.FC<AutoScheduleResultsProps> = ({
  result,
  onClose
}) => {
  if (!result) return null;
  
  const { 
    totalTasksProcessed,
    tasksScheduled,
    tasksSkipped,
    errors,
    scheduledTasks
  } = result;
  
  const successRate = totalTasksProcessed > 0 
    ? Math.round((tasksScheduled / totalTasksProcessed) * 100) 
    : 0;
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Info className="mr-2 h-5 w-5" /> Auto-Scheduling Results
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-slate-100 rounded-md px-3 py-2 text-sm flex items-center">
            <span className="font-medium mr-1">Processed:</span> {totalTasksProcessed} tasks
          </div>
          <div className="bg-green-100 rounded-md px-3 py-2 text-sm flex items-center text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" /> 
            <span className="font-medium mr-1">Scheduled:</span> {tasksScheduled} tasks
          </div>
          <div className="bg-yellow-100 rounded-md px-3 py-2 text-sm flex items-center text-yellow-800">
            <AlertTriangle className="h-4 w-4 mr-1" /> 
            <span className="font-medium mr-1">Skipped:</span> {tasksSkipped} tasks
          </div>
          <div className="bg-blue-100 rounded-md px-3 py-2 text-sm flex items-center text-blue-800">
            <span className="font-medium mr-1">Success Rate:</span> {successRate}%
          </div>
        </div>
        
        {errors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Errors ({errors.length})</h3>
            <ScrollArea className="max-h-32 overflow-auto">
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="bg-red-50 text-red-800 text-xs p-2 rounded">
                    <span className="font-medium">Task ID {error.taskId}:</span> {error.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {scheduledTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Successfully Scheduled Tasks</h3>
            <ScrollArea className="max-h-96 overflow-auto">
              <div className="space-y-2">
                {scheduledTasks.map((task, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="font-medium">{task.taskName}</div>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" /> {task.staffName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {task.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {task.startTime} - {task.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoScheduleResults;
