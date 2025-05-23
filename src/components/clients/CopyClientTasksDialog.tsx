import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, ArrowLeft, ClipboardCopy, Check, Filter, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getClientAdHocTasks, getClientRecurringTasks, copyClientTasks } from '@/services/clientService';
import { TaskInstance, RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

type DialogStep = 'select-client' | 'select-tasks' | 'confirmation' | 'processing' | 'success';
type TaskTab = 'ad-hoc' | 'recurring' | 'all';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

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
  const [copyProgress, setCopyProgress] = useState(0);
  const [filterPriority, setFilterPriority] = useState<FilterOption>('all');
  
  // Task selection state
  const [selectedAdHocTaskIds, setSelectedAdHocTaskIds] = useState<Set<string>>(new Set());
  const [selectedRecurringTaskIds, setSelectedRecurringTaskIds] = useState<Set<string>>(new Set());
  
  // Result state
  const [copyResults, setCopyResults] = useState<{
    recurring: RecurringTask[];
    adHoc: TaskInstance[];
  } | null>(null);
  
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
      setFilterPriority('all');
      setCopyProgress(0);
      setCopyResults(null);
    }
  }, [isOpen]);

  // Filter out the source client from the clients list
  const availableClients = clients?.filter(client => client.id !== sourceClientId) || [];
  
  // Filter tasks based on priority
  const filteredAdHocTasks = adHocTasks ? adHocTasks.filter(task => 
    filterPriority === 'all' || task.priority.toLowerCase() === filterPriority
  ) : [];
  
  const filteredRecurringTasks = recurringTasks ? recurringTasks.filter(task => 
    filterPriority === 'all' || task.priority.toLowerCase() === filterPriority
  ) : [];
  
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
    if (filteredAdHocTasks && filteredAdHocTasks.length > 0) {
      if (selectedAdHocTaskIds.size === filteredAdHocTasks.length) {
        // If all are selected, deselect all
        setSelectedAdHocTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedAdHocTaskIds(new Set(filteredAdHocTasks.map(task => task.id)));
      }
    }
  };
  
  const selectAllRecurringTasks = () => {
    if (filteredRecurringTasks && filteredRecurringTasks.length > 0) {
      if (selectedRecurringTaskIds.size === filteredRecurringTasks.length) {
        // If all are selected, deselect all
        setSelectedRecurringTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedRecurringTaskIds(new Set(filteredRecurringTasks.map(task => task.id)));
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

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setCopyProgress(Math.floor(progress));
    }, 200);
    return () => clearInterval(interval);
  };

  const handleCopy = async () => {
    if (!targetClientId || (selectedAdHocTaskIds.size === 0 && selectedRecurringTaskIds.size === 0)) {
      toast.error('Please select a target client and at least one task');
      return;
    }
    
    setIsCopying(true);
    setStep('processing');
    
    // Simulate progress during the copy operation
    const clearProgressSimulation = simulateProgress();
    
    try {
      const result = await copyClientTasks(
        Array.from(selectedRecurringTaskIds), 
        Array.from(selectedAdHocTaskIds), 
        targetClientId
      );
      
      // Store results for success screen
      setCopyResults(result);
      
      // Set progress to 100% when complete
      setCopyProgress(100);
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client-adhoc-tasks', targetClientId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['client-recurring-tasks', targetClientId]
      });
      
      // Show success screen
      setStep('success');
      toast.success(`Tasks copied successfully!`);
    } catch (error) {
      console.error('Error copying tasks:', error);
      toast.error('Failed to copy tasks. Please try again.');
      setStep('confirmation'); // Go back to confirmation step on error
    } finally {
      setIsCopying(false);
      clearProgressSimulation();
    }
  };

  const handleFinish = () => {
    onClose();
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
            
            <Alert className="mt-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You will be able to select which tasks to copy in the next step.
              </AlertDescription>
            </Alert>
          </div>
        );
      case 'select-tasks':
        return (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Select tasks to copy from {sourceClientName}:
                </p>
                <Badge variant="outline" className="mt-1">
                  {totalSelectedTasks} selected
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-gray-500">Filter by priority</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter tasks by priority level</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Select 
                  value={filterPriority} 
                  onValueChange={(value) => setFilterPriority(value as FilterOption)}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                        disabled={!filteredAdHocTasks || filteredAdHocTasks.length === 0}
                      >
                        {filteredAdHocTasks && selectedAdHocTaskIds.size === filteredAdHocTasks.length 
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
                        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                        Error loading ad-hoc tasks.
                      </div>
                    ) : !filteredAdHocTasks || filteredAdHocTasks.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">
                        {adHocTasks && adHocTasks.length > 0 && filterPriority !== 'all'
                          ? `No ${filterPriority} priority ad-hoc tasks available.`
                          : 'No ad-hoc tasks available.'}
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                        {filteredAdHocTasks.map((task) => (
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
                                  <Badge variant={`${task.priority.toLowerCase() === 'high' ? 'destructive' : 'outline'}`} className="text-xs">
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
                        disabled={!filteredRecurringTasks || filteredRecurringTasks.length === 0}
                      >
                        {filteredRecurringTasks && selectedRecurringTaskIds.size === filteredRecurringTasks.length 
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
                        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                        Error loading recurring tasks.
                      </div>
                    ) : !filteredRecurringTasks || filteredRecurringTasks.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">
                        {recurringTasks && recurringTasks.length > 0 && filterPriority !== 'all'
                          ? `No ${filterPriority} priority recurring tasks available.`
                          : 'No recurring tasks available.'}
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                        {filteredRecurringTasks.map((task) => (
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
                                  <Badge variant={`${task.priority.toLowerCase() === 'high' ? 'destructive' : 'outline'}`} className="text-xs">
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
            <div className="border rounded-md p-4 bg-gray-50">
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
            <Alert variant="warning" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will create copies of the selected tasks for the target client. The operation cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
        );
      case 'processing':
        return (
          <div className="py-6 space-y-6 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-medium mb-1">Copying tasks...</h3>
              <p className="text-sm text-gray-500">
                Please wait while your tasks are being copied.
              </p>
            </div>
            <div className="w-full space-y-2">
              <Progress value={copyProgress} className="h-2 w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Processing...</span>
                <span>{copyProgress}%</span>
              </div>
            </div>
          </div>
        );
      case 'success':
        const totalCopied = copyResults ? copyResults.recurring.length + copyResults.adHoc.length : 0;
        const targetClientName = availableClients.find(client => client.id === targetClientId)?.legalName;
        return (
          <div className="py-6 space-y-6 text-center">
            <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Tasks Copied Successfully!</h3>
              <p className="text-sm text-gray-500">
                {totalCopied} task(s) have been copied to {targetClientName}
              </p>
            </div>
            
            {copyResults && (
              <div className="border rounded-md p-4 text-left bg-gray-50">
                <h4 className="font-medium mb-2">Summary</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {copyResults.adHoc.length > 0 && (
                    <li>{copyResults.adHoc.length} ad-hoc task(s) copied</li>
                  )}
                  {copyResults.recurring.length > 0 && (
                    <li>{copyResults.recurring.length} recurring task(s) copied</li>
                  )}
                  {(copyResults.adHoc.length === 0 && copyResults.recurring.length === 0) && (
                    <li>No tasks were copied</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  const renderFooter = () => {
    switch (step) {
      case 'select-client':
      case 'select-tasks':
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
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        );
      case 'confirmation':
        return (
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <div>
              <Button variant="outline" onClick={handleBack} className="mt-2 sm:mt-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
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
            </div>
          </DialogFooter>
        );
      case 'processing':
        return null;
      case 'success':
        return (
          <DialogFooter>
            <Button onClick={handleFinish} className="w-full sm:w-auto">
              Done
            </Button>
          </DialogFooter>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className={`sm:max-w-${step === 'processing' || step === 'success' ? 'sm' : 'md'}`}>
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
