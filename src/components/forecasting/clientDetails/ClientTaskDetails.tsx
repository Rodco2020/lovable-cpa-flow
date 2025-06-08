
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, Clock, User } from 'lucide-react';

interface ClientTaskDetailsProps {
  clientId: string;
}

/**
 * Client Task Details Component
 * Container for displaying client-specific task data
 */
const ClientTaskDetails: React.FC<ClientTaskDetailsProps> = ({ clientId }) => {
  // Fetch client's recurring tasks
  const {
    data: recurringTasks,
    isLoading: loadingRecurring,
    error: recurringError
  } = useQuery({
    queryKey: ['client-recurring-tasks', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          name,
          description,
          estimated_hours,
          priority,
          category,
          status,
          is_active,
          recurrence_type,
          required_skills
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  // Fetch client's task instances
  const {
    data: taskInstances,
    isLoading: loadingInstances,
    error: instancesError
  } = useQuery({
    queryKey: ['client-task-instances', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_instances')
        .select(`
          id,
          name,
          description,
          estimated_hours,
          priority,
          category,
          status,
          due_date,
          required_skills
        `)
        .eq('client_id', clientId)
        .gte('due_date', new Date().toISOString())
        .order('due_date');

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  const isLoading = loadingRecurring || loadingInstances;
  const hasErrors = recurringError || instancesError;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading task details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasErrors) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Error loading task details
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recurring Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Tasks ({recurringTasks?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recurringTasks && recurringTasks.length > 0 ? (
            <div className="space-y-3">
              {recurringTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{task.name}</h4>
                        <Badge variant="outline">{task.category}</Badge>
                        <Badge variant={task.priority === 'High' ? 'destructive' : 
                                     task.priority === 'Medium' ? 'default' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.recurrence_type}
                        </div>
                        {task.required_skills && task.required_skills.length > 0 && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.required_skills.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={task.status === 'Active' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recurring tasks found for this client.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Task Instances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Tasks ({taskInstances?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskInstances && taskInstances.length > 0 ? (
            <div className="space-y-3">
              {taskInstances.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{task.name}</h4>
                        <Badge variant="outline">{task.category}</Badge>
                        <Badge variant={task.priority === 'High' ? 'destructive' : 
                                     task.priority === 'Medium' ? 'default' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.required_skills && task.required_skills.length > 0 && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.required_skills.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={task.status === 'Completed' ? 'default' : 
                                  task.status === 'In Progress' ? 'secondary' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming tasks found for this client.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTaskDetails;
