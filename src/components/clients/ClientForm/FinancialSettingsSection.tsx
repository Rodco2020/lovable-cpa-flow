
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';
import { StaffOption } from '@/types/staffOption';

interface FinancialSettingsSectionProps {
  form: UseFormReturn<ClientFormValues>;
  staffOptions: StaffOption[];
}

/**
 * Financial and Engagement Settings section of the client form
 * Contains fields for revenue, payment terms, billing frequency, staff liaison, 
 * task priority, and notification preferences
 */
const FinancialSettingsSection: React.FC<FinancialSettingsSectionProps> = ({ 
  form,
  staffOptions
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial & Engagement Settings</h3>
      
      <FormField
        control={form.control}
        name="expectedMonthlyRevenue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expected Monthly Revenue ($)*</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Used for revenue forecasting
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Net15">Net 15</SelectItem>
                  <SelectItem value="Net30">Net 30</SelectItem>
                  <SelectItem value="Net45">Net 45</SelectItem>
                  <SelectItem value="Net60">Net 60</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="billingFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Frequency*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                  <SelectItem value="Project-Based">Project-Based</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="staffLiaisonId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Staff Liaison</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff liaison" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No liaison assigned</SelectItem>
                {staffOptions.map((staff: StaffOption) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Staff member responsible for this client relationship
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
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
    </div>
  );
};

export default FinancialSettingsSection;
