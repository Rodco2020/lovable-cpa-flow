
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, ArrowLeft, ClipboardCopy, Check, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getClientAdHocTasks, getClientRecurringTasks, copyClientTasks } from '@/services/clientService';
import { TaskInstance, RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

type DialogStep = 'select-client' | 'select-tasks' | 'confirmation';
type TaskTab = 'ad-hoc' | 'recurring' | 'all';

const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({
  isOpen,
  onClose,
  sourceClientId,
  sourceClientName,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DialogStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TaskTab>('all');
  const [isCopying, setIsCopying] = useState(false);
  
  // Task selection state
  const [selectedAdHocTaskIds, setSelectedAdHocTaskIds] = useState<Set<string>>(new Set());
  const [selectedRecurringTaskIds, setSelectedRecurringTaskIds] = useState<Set<string>>(new Set());
  
  // Fetch all clients for the dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getAllClients(),
    enabled: isOpen,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      }
    }
  });
  
  // Fetch ad-hoc tasks for the source client
  const { 
    data: adHocTasks, 
    isLoading: adHocLoading,
    error: adHocError
  } = useQuery({
    queryKey: ['client-adhoc-tasks', sourceClientId],
    queryFn: () => getClientAdHocTasks(sourceClientId),
    enabled: isOpen && step === 'select-tasks',
  });
  
  // Fetch recurring tasks for the source client
  const { 
    data: recurringTasks, 
    isLoading: recurringLoading,
    error: recurringError
  } = useQuery({
    queryKey: ['client-recurring-tasks', sourceClientId],
    queryFn: () => getClientRecurringTasks(sourceClientId),
    enabled: isOpen && step === 'select-tasks',
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('select-client');
      setTargetClientId('');
      setSelectedAdHocTaskIds(new Set());
      setSelectedRecurringTaskIds(new Set());
      setActiveTab('all');
    }
  }, [isOpen]);

  // Filter out the source client from the clients list
  const availableClients = clients?.filter(client => client.id !== sourceClientId) || [];
  
  // Task selection handlers
  const toggleAdHocTask = (taskId: string) => {
    const newSelection = new Set(selectedAdHocTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedAdHocTaskIds(newSelection);
  };
  
  const toggleRecurringTask = (taskId: string) => {
    const newSelection = new Set(selectedRecurringTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedRecurringTaskIds(newSelection);
  };
  
  const selectAllAdHocTasks = () => {
    if (adHocTasks && adHocTasks.length > 0) {
      if (selectedAdHocTaskIds.size === adHocTasks.length) {
        // If all are selected, deselect all
        setSelectedAdHocTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedAdHocTaskIds(new Set(adHocTasks.map(task => task.id)));
      }
    }
  };
  
  const selectAllRecurringTasks = () => {
    if (recurringTasks && recurringTasks.length > 0) {
      if (selectedRecurringTaskIds.size === recurringTasks.length) {
        // If all are selected, deselect all
        setSelectedRecurringTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedRecurringTaskIds(new Set(recurringTasks.map(task => task.id)));
      }
    }
  };

  // Get total selected tasks count
  const totalSelectedTasks = selectedAdHocTaskIds.size + selectedRecurringTaskIds.size;

  const handleNext = () => {
    if (step === 'select-client') {
      if (!targetClientId) {
        toast.error('Please select a target client');
        return;
      }
      setStep('select-tasks');
    } else if (step === 'select-tasks') {
      if (totalSelectedTasks === 0) {
        toast.error('Please select at least one task to copy');
        return;
      }
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'select-tasks') {
      setStep('select-client');
    } else if (step === 'confirmation') {
      setStep('select-tasks');
    }
  };

  const handleCopy = async () => {
    if (!targetClientId || (selectedAdHocTaskIds.size === 0 && selectedRecurringTaskIds.size === 0)) {
      toast.error('Please select a target client and at least one task');
      return;
    }
    
    setIsCopying(true);
    
    try {
      const result = await copyClientTasks(
        Array.from(selectedRecurringTaskIds), 
        Array.from(selectedAdHocTaskIds), 
        targetClientId
      );
      
      const totalCopied = result.recurring.length + result.adHoc.length;
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client-adhoc-tasks', targetClientId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['client-recurring-tasks', targetClientId]
      });
      
      toast.success(`${totalCopied} task(s) copied successfully!`);
      onClose();
    } catch (error) {
      console.error('Error copying tasks:', error);
      toast.error('Failed to copy tasks. Please try again.');
    } finally {
      setIsCopying(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select-client':
        return (
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-500">
              Select a client to copy tasks to:
            </p>
            <Select
              value={targetClientId}
              onValueChange={(value) => setTargetClientId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <div className="p-2 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading clients...</span>
                  </div>
                ) : availableClients.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">No other clients available</div>
                ) : (
                  availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.legalName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
      case 'select-tasks':
        return (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Select tasks to copy from {sourceClientName}:
              </p>
              <Badge variant="outline" className="ml-2">
                {totalSelectedTasks} selected
              </Badge>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={value => setActiveTab(value as TaskTab)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="ad-hoc">Ad-hoc Tasks</TabsTrigger>
                <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                {/* Ad-hoc Tasks */}
                {(activeTab === 'all' || activeTab === 'ad-hoc') && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Ad-hoc Tasks</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllAdHocTasks}
                        disabled={!adHocTasks || adHocTasks.length === 0}
                      >
                        {adHocTasks && selectedAdHocTaskIds.size === adHocTasks.length 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </Button>
                    </div>
                    
                    {adHocLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading ad-hoc tasks...</span>
                      </div>
                    ) : adHocError ? (
                      <div className="text-center p-4 text-red-500">
                        Error loading ad-hoc tasks.
                      </div>
                    ) : !adHocTasks || adHocTasks.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">
                        No ad-hoc tasks available.
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {adHocTasks.map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-center p-3 hover:bg-gray-50"
                          >
                            <Checkbox 
                              id={`adhoc-${task.id}`}
                              checked={selectedAdHocTaskIds.has(task.id)}
                              onCheckedChange={() => toggleAdHocTask(task.id)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`adhoc-${task.id}`} 
                                className="font-medium cursor-pointer"
                              >
                                {task.name}
                              </label>
                              <div className="text-xs text-gray-500 mt-1">
                                {task.description && <p>{task.description}</p>}
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {task.estimatedHours}h
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recurring Tasks */}
                {(activeTab === 'all' || activeTab === 'recurring') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Recurring Tasks</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllRecurringTasks}
                        disabled={!recurringTasks || recurringTasks.length === 0}
                      >
                        {recurringTasks && selectedRecurringTaskIds.size === recurringTasks.length 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </Button>
                    </div>
                    
                    {recurringLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading recurring tasks...</span>
                      </div>
                    ) : recurringError ? (
                      <div className="text-center p-4 text-red-500">
                        Error loading recurring tasks.
                      </div>
                    ) : !recurringTasks || recurringTasks.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">
                        No recurring tasks available.
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {recurringTasks.map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-center p-3 hover:bg-gray-50"
                          >
                            <Checkbox 
                              id={`recurring-${task.id}`}
                              checked={selectedRecurringTaskIds.has(task.id)}
                              onCheckedChange={() => toggleRecurringTask(task.id)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`recurring-${task.id}`} 
                                className="font-medium cursor-pointer"
                              >
                                {task.name}
                              </label>
                              <div className="text-xs text-gray-500 mt-1">
                                {task.description && <p>{task.description}</p>}
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {task.estimatedHours}h
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.recurrencePattern.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        );
      case 'confirmation':
        const targetClient = availableClients.find(client => client.id === targetClientId);
        return (
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-500">
              You are about to copy {totalSelectedTasks} selected tasks:
            </p>
            <div className="border rounded-md p-4">
              <p><strong>From:</strong> {sourceClientName}</p>
              <p><strong>To:</strong> {targetClient?.legalName}</p>
              <div className="mt-2">
                <p><strong>Selected tasks:</strong></p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {selectedAdHocTaskIds.size > 0 && (
                    <li>{selectedAdHocTaskIds.size} ad-hoc task(s)</li>
                  )}
                  {selectedRecurringTaskIds.size > 0 && (
                    <li>{selectedRecurringTaskIds.size} recurring task(s)</li>
                  )}
                </ul>
              </div>
            </div>
            <p className="text-sm text-amber-600 font-semibold">
              This action will create copies of the selected tasks for the target client.
            </p>
          </div>
        );
    }
  };

  const renderFooter = () => {
    return (
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          {step !== 'select-client' && (
            <Button variant="outline" onClick={handleBack} className="mt-2 sm:mt-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step === 'confirmation' ? (
            <Button 
              onClick={handleCopy} 
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy Tasks
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Client Tasks</DialogTitle>
          <DialogDescription>
            Copy tasks from {sourceClientName} to another client
          </DialogDescription>
        </DialogHeader>
        {renderStepContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
