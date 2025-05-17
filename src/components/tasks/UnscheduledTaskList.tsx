
import React, { useEffect, useState } from 'react';
import { TaskInstance } from '@/types/task';
import { getUnscheduledTaskInstances } from '@/services/taskService';
import { Loader2, AlertCircle } from 'lucide-react';

const UnscheduledTaskList = () => {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await getUnscheduledTaskInstances();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error("Error loading unscheduled tasks:", err);
        setError("Failed to load unscheduled tasks");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center p-4 bg-destructive/10 rounded-md text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No unscheduled tasks found.
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Unscheduled Tasks ({tasks.length})</h2>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="border p-4 rounded-md">
            <div className="font-medium">{task.name}</div>
            <div className="text-sm text-muted-foreground">
              Due: {task.dueDate?.toLocaleDateString()}
            </div>
            <div className="text-sm">
              Client ID: {task.clientId}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnscheduledTaskList;
