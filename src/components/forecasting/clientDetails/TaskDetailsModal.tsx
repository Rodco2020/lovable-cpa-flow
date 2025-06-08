
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  ExternalLink
} from 'lucide-react';
import { useTabNavigation } from '@/hooks/useTabNavigation';

interface TaskData {
  id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  priority: string;
  category: string;
  status: string;
  due_date?: string;
  required_skills: string[];
  is_active?: boolean;
  recurrence_type?: string;
  notes?: string;
  assigned_staff_id?: string;
  completed_at?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskData | null;
  clientName?: string;
}

const getStatusIcon = (status: string, isActive?: boolean) => {
  if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (status === 'In Progress') return <Play className="h-4 w-4 text-blue-600" />;
  if (isActive === false) return <Pause className="h-4 w-4 text-gray-600" />;
  return <AlertCircle className="h-4 w-4 text-orange-600" />;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'destructive';
    case 'Medium': return 'default';
    case 'Low': return 'secondary';
    default: return 'outline';
  }
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  clientName
}) => {
  const { navigateToMatrix, navigateWithClientContext } = useTabNavigation();

  if (!task) return null;

  const handleNavigateToMatrix = () => {
    // Navigate to matrix with this task's skills highlighted
    navigateToMatrix({ 
      taskId: task.id,
      fromTab: 'client-details'
    });
    onClose();
  };

  const handleNavigateWithClientContext = () => {
    // Navigate to another tab while maintaining client context
    if (clientName) {
      navigateWithClientContext('charts', task.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{task.name}</CardTitle>
                  {clientName && (
                    <div className="text-sm text-muted-foreground">
                      Client: {clientName}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status, task.is_active)}
                  <Badge variant={getPriorityColor(task.priority) as any}>
                    {task.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {task.description && (
              <CardContent>
                <p className="text-muted-foreground">{task.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline">{task.category}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status, task.is_active)}
                    <span className="text-sm">{task.status}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Estimated Hours:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono">{task.estimated_hours}h</span>
                  </div>
                </div>

                {task.recurrence_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recurrence:</span>
                    <Badge variant="secondary">{task.recurrence_type}</Badge>
                  </div>
                )}

                {task.is_active !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active:</span>
                    <Badge variant={task.is_active ? 'default' : 'secondary'}>
                      {task.is_active ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.due_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Due Date:</span>
                    <span className="text-sm">
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {task.scheduled_start_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Scheduled Start:</span>
                    <span className="text-sm">
                      {new Date(task.scheduled_start_time).toLocaleString()}
                    </span>
                  </div>
                )}

                {task.scheduled_end_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Scheduled End:</span>
                    <span className="text-sm">
                      {new Date(task.scheduled_end_time).toLocaleString()}
                    </span>
                  </div>
                )}

                {task.completed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed:</span>
                    <span className="text-sm">
                      {new Date(task.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {task.assigned_staff_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Assigned Staff:</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{task.assigned_staff_id}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Skills Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Skills Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {task.required_skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="hover:bg-primary/10 cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              {task.required_skills.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No specific skills required
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {task.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{task.notes}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleNavigateToMatrix}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View in Matrix
              </Button>
              
              {clientName && (
                <Button
                  variant="outline"
                  onClick={handleNavigateWithClientContext}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View in Charts
                </Button>
              )}
            </div>
            
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
