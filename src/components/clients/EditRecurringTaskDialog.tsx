
import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, AlertCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditRecurringTaskDialogProps } from './types';
import { useEditTaskForm } from './hooks/useEditTaskForm';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { FormHeader } from './components/FormHeader';
import { SkillsSelection } from './components/SkillsSelection';
import { RecurrenceSettings } from './components/RecurrenceSettings';

export function EditRecurringTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onSave,
  isLoading = false,
  loadError = null,
  attemptedLoad = false
}: EditRecurringTaskDialogProps) {
  const [retryLoading, setRetryLoading] = useState(false);
  
  const {
    form,
    isSaving,
    formError,
    selectedSkills,
    setSelectedSkills,
    skillsError,
    toggleSkill,
    onSubmit
  } = useEditTaskForm({
    task,
    onSave,
    onSuccess: () => {
      onOpenChange(false);
      clearInitialForm();
    }
  });

  const {
    showUnsavedChangesAlert,
    setShowUnsavedChangesAlert,
    hasUnsavedChanges,
    clearInitialForm
  } = useUnsavedChanges(form, task, open);

  const recurrenceType = form.watch('recurrenceType');
  
  // Handle dialog close with confirmation if there are unsaved changes
  const handleDialogClose = (open: boolean) => {
    if (!open && hasUnsavedChanges() && !isSaving) {
      setShowUnsavedChangesAlert(true);
    } else {
      onOpenChange(open);
    }
  };

  // Handle retry loading after an error
  const handleRetryLoad = () => {
    if (!open) return;
    
    setRetryLoading(true);
    // Trigger a re-render which will cause the useEffect to run again
    // This is cleaner than duplicating the loading logic
    onOpenChange(false);
    setTimeout(() => {
      onOpenChange(true);
      setRetryLoading(false);
    }, 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          aria-labelledby="edit-task-title"
          aria-describedby="edit-task-description"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && hasUnsavedChanges()) {
              e.preventDefault();
              setShowUnsavedChangesAlert(true);
            }
          }}
        >
          <FormHeader task={task} open={open} />
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8" aria-live="polite" role="status">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" 
                   aria-hidden="true">
              </div>
              <span className="ml-2">Loading task data...</span>
            </div>
          )}
          
          {/* Error State with Retry */}
          {loadError && attemptedLoad && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <div>{loadError}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryLoad} 
                  disabled={retryLoading}
                  className="w-fit"
                  aria-label="Retry loading task data"
                >
                  {retryLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Form Error State */}
          {formError && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {/* Task Status Warning for Inactive Tasks */}
          {task && task.isActive === false && !isLoading && !loadError && (
            <Alert variant="warning" className="mb-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You are editing an inactive task. The task will remain inactive after updates.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Successful Form Render */}
          {task && !isLoading && !loadError && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="edit-task-form">
                <div id="edit-task-description" className="sr-only">
                  Form to edit task details, recurrence patterns, and scheduling options.
                </div>
                
                {/* Task Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="task-name">Task Name</FormLabel>
                      <FormControl>
                        <Input 
                          id="task-name" 
                          {...field} 
                          placeholder="Enter task name" 
                          aria-required="true" 
                        />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="task-description">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          id="task-description" 
                          {...field} 
                          placeholder="Task description" 
                          rows={2} 
                        />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Priority and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="task-priority">Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger id="task-priority" aria-label="Select priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="task-category">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger id="task-category" aria-label="Select category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tax">Tax</SelectItem>
                            <SelectItem value="Audit">Audit</SelectItem>
                            <SelectItem value="Advisory">Advisory</SelectItem>
                            <SelectItem value="Compliance">Compliance</SelectItem>
                            <SelectItem value="Bookkeeping">Bookkeeping</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Skills Selection Component */}
                <SkillsSelection 
                  selectedSkills={selectedSkills}
                  toggleSkill={toggleSkill}
                  skillsError={skillsError}
                />

                {/* Estimated Hours and Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="estimated-hours">Estimated Hours</FormLabel>
                        <FormControl>
                          <Input 
                            id="estimated-hours"
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                            min="0.25" 
                            step="0.25" 
                            aria-label="Enter estimated hours"
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>First Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                aria-label="Select due date"
                                aria-haspopup="dialog"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Recurrence Settings Component */}
                <RecurrenceSettings form={form} recurrenceType={recurrenceType} />

                {/* Form Actions */}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => handleDialogClose(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    aria-busy={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Unsaved Changes Alert */}
      <AlertDialog 
        open={showUnsavedChangesAlert} 
        onOpenChange={setShowUnsavedChangesAlert}
      >
        <AlertDialogContent aria-labelledby="alert-title" aria-describedby="alert-description">
          <AlertDialogHeader>
            <AlertDialogTitle id="alert-title" className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription id="alert-description">
              You have unsaved changes that will be lost if you close this dialog.
              Do you want to continue without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onOpenChange(false);
                setShowUnsavedChangesAlert(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
