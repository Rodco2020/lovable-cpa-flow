
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TaskInstance, TaskPriority } from '@/types/task';

interface EditAdHocTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskInstance | null;
  onSave: (task: Partial<TaskInstance>) => Promise<void>;
  isLoading: boolean;
  loadError: string | null;
  attemptedLoad: boolean;
}

export function EditAdHocTaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  isLoading,
  loadError,
  attemptedLoad
}: EditAdHocTaskDialogProps) {
  // Local state for form values
  const [formValues, setFormValues] = useState<Partial<TaskInstance>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Update form values when task changes
  useState(() => {
    if (task) {
      setFormValues({
        id: task.id,
        name: task.name,
        description: task.description,
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        dueDate: task.dueDate,
        notes: task.notes,
        status: task.status
      });
    }
  });
  
  // Handle form input changes
  const handleInputChange = (field: keyof TaskInstance, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset error when user makes changes
    if (saveError) {
      setSaveError(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.id) {
      setSaveError("Task ID is missing");
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Call the parent component's save function
      await onSave({
        ...formValues,
        id: task?.id
      });
      
      // Close the dialog on successful save
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Determine if we should show loading, error, or form content
  const showLoading = isLoading;
  const showError = !isLoading && loadError && attemptedLoad;
  const showContent = !isLoading && !loadError && task;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Ad-hoc Task</DialogTitle>
          <DialogDescription>
            Make changes to the task details below.
          </DialogDescription>
        </DialogHeader>
        
        {showLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading task...</span>
          </div>
        )}
        
        {showError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}
        
        {showContent && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Task Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  value={formValues.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formValues.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Hours */}
                <div className="grid gap-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.25"
                    value={formValues.estimatedHours || ''}
                    onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value))}
                    required
                  />
                </div>
                
                {/* Priority */}
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formValues.priority || ''}
                    onValueChange={(value) => handleInputChange('priority', value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !formValues.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formValues.dueDate ? format(new Date(formValues.dueDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formValues.dueDate ? new Date(formValues.dueDate) : undefined}
                        onSelect={(date) => handleInputChange('dueDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formValues.status || ''}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formValues.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Required Skills (read-only) */}
              <div className="grid gap-2">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                  {task.requiredSkills?.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                  {(!task.requiredSkills || task.requiredSkills.length === 0) && (
                    <span className="text-sm text-muted-foreground">No skills specified</span>
                  )}
                </div>
              </div>
              
              {/* Save Error */}
              {saveError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
