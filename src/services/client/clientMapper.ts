
import { Client } from '@/types/client';

/**
 * Maps database record to Client model
 * @param dbRecord The raw database record
 * @returns Mapped Client object
 */
export const mapClientFromDbRecord = (dbRecord: any): Client => {
  return {
    id: dbRecord.id,
    legalName: dbRecord.legal_name,
    primaryContact: dbRecord.primary_contact,
    email: dbRecord.email,
    phone: dbRecord.phone,
    billingAddress: dbRecord.billing_address,
    industry: dbRecord.industry,
    status: dbRecord.status,
    expectedMonthlyRevenue: Number(dbRecord.expected_monthly_revenue),
    paymentTerms: dbRecord.payment_terms,
    billingFrequency: dbRecord.billing_frequency,
    defaultTaskPriority: dbRecord.default_task_priority,
    staffLiaisonId: dbRecord.staff_liaison_id,
    staffLiaisonName: dbRecord.staff?.full_name || null,
    notificationPreferences: dbRecord.notification_preferences || {
      emailReminders: true,
      taskNotifications: true,
    },
    createdAt: new Date(dbRecord.created_at),
    updatedAt: new Date(dbRecord.updated_at),
  };
};

/**
 * Maps Client model to database record
 * @param client The Client object
 * @returns Database record object
 */
export const mapClientToDbRecord = (client: Partial<Client>): any => {
  const dbRecord: any = {};
  
  if (client.legalName !== undefined) dbRecord.legal_name = client.legalName;
  if (client.primaryContact !== undefined) dbRecord.primary_contact = client.primaryContact;
  if (client.email !== undefined) dbRecord.email = client.email;
  if (client.phone !== undefined) dbRecord.phone = client.phone;
  if (client.billingAddress !== undefined) dbRecord.billing_address = client.billingAddress;
  if (client.industry !== undefined) dbRecord.industry = client.industry;
  if (client.status !== undefined) dbRecord.status = client.status;
  if (client.expectedMonthlyRevenue !== undefined) dbRecord.expected_monthly_revenue = client.expectedMonthlyRevenue;
  if (client.paymentTerms !== undefined) dbRecord.payment_terms = client.paymentTerms;
  if (client.billingFrequency !== undefined) dbRecord.billing_frequency = client.billingFrequency;
  if (client.defaultTaskPriority !== undefined) dbRecord.default_task_priority = client.defaultTaskPriority;
  if (client.staffLiaisonId !== undefined) dbRecord.staff_liaison_id = client.staffLiaisonId;
  if (client.notificationPreferences !== undefined) dbRecord.notification_preferences = client.notificationPreferences;
  
  return dbRecord;
};
