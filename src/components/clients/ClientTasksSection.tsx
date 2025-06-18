
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ClientRecurringTaskList from './ClientRecurringTaskList';
import ClientAdHocTaskList from './ClientAdHocTaskList';
import TaskAssignmentWizard from './TaskWizard/TaskAssignmentWizard';
import TaskForm from '../tasks/TaskForm';

interface ClientTasksSectionProps {
  clientId: string;
  onTaskUpdate?: () => void;
}

const ClientTasksSection: React.FC<ClientTasksSectionProps> = ({ 
  clientId, 
  onTaskUpdate 
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskWizard, setShowTaskWizard] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Task Management</CardTitle>
          <div className="flex space-x-2">
            <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <TaskForm 
                  clientId={clientId} 
                  onClose={() => setShowTaskForm(false)}
                  onTaskCreated={() => {
                    setShowTaskForm(false);
                    onTaskUpdate?.();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showTaskWizard} onOpenChange={setShowTaskWizard}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Task Wizard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <TaskAssignmentWizard />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
            <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="recurring" className="space-y-4">
            <ClientRecurringTaskList 
              clientId={clientId} 
              onTaskUpdate={onTaskUpdate}
            />
          </TabsContent>
          <TabsContent value="adhoc" className="space-y-4">
            <ClientAdHocTaskList 
              clientId={clientId} 
              onTaskUpdate={onTaskUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientTasksSection;
