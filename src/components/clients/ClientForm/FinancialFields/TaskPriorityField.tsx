
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface TaskPriorityFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Task Priority Field Component
 * 
 * Displays and manages the default task priority dropdown selector
 */
export const TaskPriorityField: React.FC<TaskPriorityFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="defaultTaskPriority"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Default Task Priority*</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
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
          <FormDescription>
            Default priority for new tasks assigned to this client
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
