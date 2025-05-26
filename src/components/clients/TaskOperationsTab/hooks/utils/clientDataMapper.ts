import { IndustryType, PaymentTerms, BillingFrequency, Client } from '@/types/client';

/**
 * Maps raw client data from Supabase to the Client type
 * Handles safe parsing of notification preferences JSON
 */
export const mapClientData = (rawClient: any): Client => {
  // Parse notification preferences safely
  let notificationPreferences = {
    emailReminders: true,
    taskNotifications: true
  };

  if (rawClient.notification_preferences) {
    try {
      if (typeof rawClient.notification_preferences === 'string') {
        notificationPreferences = JSON.parse(rawClient.notification_preferences);
      } else if (typeof rawClient.notification_preferences === 'object') {
        notificationPreferences = rawClient.notification_preferences as any;
      }
    } catch (e) {
      console.warn('Failed to parse notification preferences for client:', rawClient.id, e);
      // Keep default values
    }
  }

  return {
    id: rawClient.id,
    legalName: rawClient.legal_name,
    primaryContact: rawClient.primary_contact,
    email: rawClient.email,
    phone: rawClient.phone,
    billingAddress: rawClient.billing_address,
    industry: rawClient.industry as IndustryType,
    status: rawClient.status as 'Active' | 'Inactive',
    paymentTerms: rawClient.payment_terms as PaymentTerms,
    billingFrequency: rawClient.billing_frequency as BillingFrequency,
    expectedMonthlyRevenue: rawClient.expected_monthly_revenue,
    defaultTaskPriority: rawClient.default_task_priority,
    staffLiaisonId: rawClient.staff_liaison_id,
    notificationPreferences,
    createdAt: new Date(rawClient.created_at),
    updatedAt: new Date(rawClient.updated_at)
  };
};
