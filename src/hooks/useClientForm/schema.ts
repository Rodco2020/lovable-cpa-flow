
import { z } from 'zod';
import { ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';

/**
 * Form schema for client data validation
 */
export const clientFormSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  primaryContact: z.string().min(1, "Primary contact is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  industry: z.enum([
    "Retail", 
    "Healthcare", 
    "Manufacturing", 
    "Technology", 
    "Financial Services", 
    "Professional Services", 
    "Construction", 
    "Hospitality", 
    "Education", 
    "Non-Profit",
    "Other"
  ] as const),
  status: z.enum(["Active", "Inactive", "Pending", "Archived"] as const),
  expectedMonthlyRevenue: z.coerce.number().positive("Revenue must be positive"),
  paymentTerms: z.enum(["Net15", "Net30", "Net45", "Net60"] as const),
  billingFrequency: z.enum(["Monthly", "Quarterly", "Annually", "Project-Based"] as const),
  defaultTaskPriority: z.string().min(1, "Default task priority is required"),
  staffLiaisonId: z.string().nullable().optional(),
  notificationPreferences: z.object({
    emailReminders: z.boolean().default(true),
    taskNotifications: z.boolean().default(true),
  }),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

/**
 * Default values for the client form
 */
export const getDefaultValues = (): ClientFormValues => ({
  legalName: "",
  primaryContact: "",
  email: "",
  phone: "",
  billingAddress: "",
  industry: "Other" as IndustryType,
  status: "Active" as ClientStatus,
  expectedMonthlyRevenue: 0,
  paymentTerms: "Net30" as PaymentTerms,
  billingFrequency: "Monthly" as BillingFrequency,
  defaultTaskPriority: "Medium",
  staffLiaisonId: null,
  notificationPreferences: {
    emailReminders: true,
    taskNotifications: true,
  },
});
