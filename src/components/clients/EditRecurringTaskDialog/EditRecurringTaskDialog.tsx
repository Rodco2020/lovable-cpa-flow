
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { EditRecurringTaskDialogProps } from './types';
import { useEditTaskForm } from './hooks/useEditTaskForm';
import { FormHeader } from './components/FormHeader';
import { RecurrenceSettings } from './components/RecurrenceSettings';
import { SkillsSelection } from './components/SkillsSelection';
import { PreferredStaffField } from './components/PreferredStaffField';

/**
 * Edit Recurring Task Dialog Component
 * 
 * Provides a comprehensive interface for editing recurring task details including:
 * - Basic task information (name, description, hours, priority, category)
 * - Preferred staff assignment (optional)
 * - Required skills selection
 * - Recurrence pattern configuration
 * 
 * Features:
 * - Form validation with real-time feedback
 * - Preferred staff dropdown with error handling and retry capability
 * - Skills multi-selection with validation
 * - Comprehensive error handling and loading states
 * - Accessibility compliant with WCAG guidelines
 */
const EditRecurringTaskDialog: React.FC<EditRecurringTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSave,
  isLoading = false,
  loadError = null,
  attemptedLoad = false
}) => {
  const {
    form,
    isSaving,
    formError,
    selectedSkills,
    skillsError,
    toggleSkill,
    onSubmit
  } = useEditTaskForm({
    task,
    onSave,
    onSuccess: () => onOpenChange(false)
  });

  // Enhanced handleSubmit with comprehensive logging
  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('🚀 [EditRecurringTaskDialog] Form submission initiated');
    console.log('📋 [EditRecurringTaskDialog] Complete form values:', form.getValues());
    console.log('📝 [EditRecurringTaskDialog] Submitted data:', data);
    console.log('👤 [EditRecurringTaskDialog] Preferred Staff ID:', data.preferredStaffId);
    console.log('🏷️ [EditRecurringTaskDialog] Preferred Staff Type:', typeof data.preferredStaffId);
    console.log('✅ [EditRecurringTaskDialog] Is Valid Staff ID:', data.preferredStaffId === null || (typeof data.preferredStaffId === 'string' && data.preferredStaffId.length > 0));
    
    try {
      await onSubmit(data);
      console.log('✅ [EditRecurringTaskDialog] Form submission completed successfully');
    } catch (error) {
      console.error('❌ [EditRecurringTaskDialog] Form submission failed:', error);
    }
  });

  // Handle loading state
  if (isLoading || (!task && !attemptedLoad)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading task details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle error state
  if (loadError || (!task && attemptedLoad)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Error Loading Task</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {loadError || "Task not found or could not be loaded."}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormHeader task={task} open={open} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter task name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter task description" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.25"
                            min="0.25"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Staff Field - Production Ready */}
                <PreferredStaffField form={form} />
              </div>

              {/* Skills and Recurrence */}
              <div className="space-y-4">
                <SkillsSelection
                  selectedSkills={selectedSkills}
                  toggleSkill={toggleSkill}
                  error={skillsError}
                />
                
                <RecurrenceSettings 
                  form={form} 
                  recurrenceType={form.watch('recurrenceType')}
                />
              </div>
            </div>

            {/* Error Display */}
            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecurringTaskDialog;
