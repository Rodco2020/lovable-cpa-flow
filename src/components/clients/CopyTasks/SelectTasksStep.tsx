
// Fixing error TS2739: Type '{}' is missing the following properties from type 'Error': name, message
// We just need to update the error handling in this file

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { Task } from '@/types/task';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DialogFooter } from './DialogFooter';
import TaskSelectionList from './TaskSelectionList';

interface SelectTasksStepProps {
  sourceClientId: string;
  targetClientId: string;
  onNext: () => void;
  onBack: () => void;
  onTasksSelected: (tasks: Task[]) => void;
}

const SelectTasksStep: React.FC<SelectTasksStepProps> = ({
  sourceClientId,
  targetClientId,
  onNext,
  onBack,
  onTasksSelected
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);
  const [adHocTasks, setAdHocTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const queryClient = useQueryClient();

  // Fetch tasks when component mounts
  React.useEffect(() => {
    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      try {
        // Get recurring tasks
        const recurring = await getClientRecurringTasks(sourceClientId);
        setRecurringTasks(recurring || []);

        // Get ad-hoc tasks
        const adHoc = await getClientAdHocTasks(sourceClientId);
        setAdHocTasks(adHoc || []);
      } catch (error) {
        // Fix the error type here
        const err = error as Error; // Cast to Error type
        toast({
          title: "Failed to load tasks",
          description: err.message || "An error occurred while loading tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [sourceClientId]);

  const handleTaskSelectionChange = (task: Task, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks([...selectedTasks, task]);
    } else {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    }
  };

  const handleNext = () => {
    if (selectedTasks.length === 0) {
      try {
        throw new Error("Please select at least one task to copy");
      } catch (error) {
        // Fix the error type here
        const err = error as Error; // Cast to Error type
        toast({
          title: "No tasks selected",
          description: err.message,
          variant: "destructive",
        });
        return;
      }
    }

    // Invalidate relevant queries to ensure fresh data after task copying
    queryClient.invalidateQueries({ queryKey: ['client', targetClientId, 'tasks'] });
    queryClient.invalidateQueries({ queryKey: ['client', targetClientId, 'recurring-tasks'] });

    onTasksSelected(selectedTasks);
    onNext();
  };

  return (
    <div className="space-y-4 py-4 pb-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Select Tasks to Copy</h2>
        <p className="text-sm text-muted-foreground">
          Choose which tasks you want to copy from the source client to the target client.
        </p>
      </div>

      {isLoadingTasks ? (
        <div className="flex items-center justify-center p-6">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
            <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recurring" className="space-y-4 pt-4">
            {recurringTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recurring tasks available</p>
            ) : (
              <TaskSelectionList 
                tasks={recurringTasks}
                selectedTasks={selectedTasks}
                onSelectionChange={handleTaskSelectionChange}
              />
            )}
          </TabsContent>
          
          <TabsContent value="adhoc" className="space-y-4 pt-4">
            {adHocTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No ad-hoc tasks available</p>
            ) : (
              <TaskSelectionList 
                tasks={adHocTasks}
                selectedTasks={selectedTasks}
                onSelectionChange={handleTaskSelectionChange}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm">
          <Label>{selectedTasks.length} tasks selected</Label>
        </div>
      </div>

      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isLoading}
        >
          <X className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={isLoading || selectedTasks.length === 0}
        >
          {isLoading ? "Processing..." : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Next
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default SelectTasksStep;
