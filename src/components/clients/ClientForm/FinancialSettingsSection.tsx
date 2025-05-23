
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';
import { StaffOption } from '@/types/staffOption';
import { RevenueField } from './FinancialFields/RevenueField';
import { PaymentBillingFields } from './FinancialFields/PaymentBillingFields';
import { StaffLiaisonField } from './FinancialFields/StaffLiaisonField';
import { TaskPriorityField } from './FinancialFields/TaskPriorityField';
import { NotificationPreferencesField } from './FinancialFields/NotificationPreferencesField';

interface FinancialSettingsSectionProps {
  form: UseFormReturn<ClientFormValues>;
  staffOptions: StaffOption[];
}

/**
 * Financial and Engagement Settings section of the client form
 * 
 * This component organizes financial and engagement-related form fields including:
 * - Expected monthly revenue
 * - Payment terms and billing frequency
 * - Staff liaison assignment
 * - Default task priority
 * - Notification preferences
 * 
 * It uses modular components for each field or related field group to improve
 * maintainability and readability.
 */
const FinancialSettingsSection: React.FC<FinancialSettingsSectionProps> = ({ 
  form,
  staffOptions
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial & Engagement Settings</h3>
      
      {/* Expected Monthly Revenue */}
      <RevenueField form={form} />
      
      {/* Payment Terms and Billing Frequency */}
      <PaymentBillingFields form={form} />
      
      {/* Staff Liaison */}
      <StaffLiaisonField form={form} staffOptions={staffOptions} />
      
      {/* Default Task Priority */}
      <TaskPriorityField form={form} />
      
      {/* Notification Preferences */}
      <NotificationPreferencesField form={form} />
    </div>
  );
};

export default FinancialSettingsSection;
