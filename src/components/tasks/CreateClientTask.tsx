
import React, { useState } from 'react';
import { RecurringTask } from '@/types/task';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import TaskForm from './TaskForm';

interface CreateClientTaskProps {
  onTaskCreated?: (task: RecurringTask) => void;
}

/**
 * CreateClientTask Component
 * 
 * A card component that provides access to the task creation flow via a dialog.
 * This component serves as the entry point for users to create new client-assigned tasks.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onTaskCreated - Optional callback when a task is created successfully
 */
const CreateClientTask: React.FC<CreateClientTaskProps> = ({ onTaskCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  /**
   * Handles successful task creation and forwards the new task to the parent callback
   * 
   * @param {RecurringTask} task - The newly created recurring task
   */
  const handleTaskSuccess = (task: RecurringTask) => {
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  /**
   * Closes the task creation dialog
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tasks to Clients</CardTitle>
        <CardDescription>
          Create new client-assigned tasks, either one-time or recurring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" aria-label="Assign new task to client">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Task to Client</DialogTitle>
            </DialogHeader>
            <TaskForm onClose={handleCloseDialog} onSuccess={handleTaskSuccess} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CreateClientTask;
