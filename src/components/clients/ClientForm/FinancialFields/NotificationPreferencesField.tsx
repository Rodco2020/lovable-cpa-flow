
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface NotificationPreferencesFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Notification Preferences Field Component
 * 
 * Displays and manages the notification preferences checkboxes
 */
export const NotificationPreferencesField: React.FC<NotificationPreferencesFieldProps> = ({ form }) => {
  return (
    <div className="space-y-3 mt-6">
      <h4 className="text-sm font-medium">Notification Preferences</h4>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="emailReminders" 
          checked={form.watch("notificationPreferences.emailReminders")}
          onCheckedChange={(checked) => {
            form.setValue("notificationPreferences.emailReminders", checked as boolean);
          }}
        />
        <Label htmlFor="emailReminders">Email reminders for upcoming tasks</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="taskNotifications" 
          checked={form.watch("notificationPreferences.taskNotifications")}
          onCheckedChange={(checked) => {
            form.setValue("notificationPreferences.taskNotifications", checked as boolean);
          }}
        />
        <Label htmlFor="taskNotifications">Task status change notifications</Label>
      </div>
    </div>
  );
};
