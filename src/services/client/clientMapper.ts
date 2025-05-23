
import { Client } from '@/types/client';

/**
 * Map database record to Client model
 * 
 * @param record Database record with snake_case keys
 * @returns Client object with camelCase keys
 */
export const mapClientFromDbRecord = (record: any): Client => {
  return {
    id: record.id,
    legalName: record.legal_name,
    primaryContact: record.primary_contact,
    email: record.email,
    phone: record.phone,
    billingAddress: record.billing_address,
    industry: record.industry,
    status: record.status,
    expectedMonthlyRevenue: record.expected_monthly_revenue,
    paymentTerms: record.payment_terms,
    billingFrequency: record.billing_frequency,
    defaultTaskPriority: record.default_task_priority,
    staffLiaisonId: record.staff_liaison_id,
    notificationPreferences: record.notification_preferences || {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at)
  };
};

/**
 * Map Client model to database record
 * 
 * @param client Client object with camelCase keys
 * @returns Database record with snake_case keys
 */
export const mapClientToDbRecord = (client: Partial<Client>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  if (client.legalName !== undefined) result.legal_name = client.legalName;
  if (client.primaryContact !== undefined) result.primary_contact = client.primaryContact;
  if (client.email !== undefined) result.email = client.email;
  if (client.phone !== undefined) result.phone = client.phone;
  if (client.billingAddress !== undefined) result.billing_address = client.billingAddress;
  if (client.industry !== undefined) result.industry = client.industry;
  if (client.status !== undefined) result.status = client.status;
  if (client.expectedMonthlyRevenue !== undefined) result.expected_monthly_revenue = client.expectedMonthlyRevenue;
  if (client.paymentTerms !== undefined) result.payment_terms = client.paymentTerms;
  if (client.billingFrequency !== undefined) result.billing_frequency = client.billingFrequency;
  if (client.defaultTaskPriority !== undefined) result.default_task_priority = client.defaultTaskPriority;
  if (client.staffLiaisonId !== undefined) result.staff_liaison_id = client.staffLiaisonId;
  if (client.notificationPreferences !== undefined) result.notification_preferences = client.notificationPreferences;
  
  return result;
};
