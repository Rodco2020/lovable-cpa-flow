
export type ClientStatus = "Active" | "Inactive" | "Pending" | "Archived";
export type IndustryType = 
  | "Retail" 
  | "Healthcare" 
  | "Manufacturing" 
  | "Technology" 
  | "Financial Services" 
  | "Professional Services" 
  | "Construction" 
  | "Hospitality" 
  | "Education" 
  | "Non-Profit"
  | "Other";

export type PaymentTerms = "Net15" | "Net30" | "Net45" | "Net60";
export type BillingFrequency = "Monthly" | "Quarterly" | "Annually" | "Project-Based";

export interface Client {
  id: string;
  legalName: string;
  primaryContact: string;
  email: string;
  phone: string;
  billingAddress: string;
  industry: IndustryType;
  status: ClientStatus;
  expectedMonthlyRevenue: number;
  paymentTerms: PaymentTerms;
  billingFrequency: BillingFrequency;
  defaultTaskPriority: string;
  notificationPreferences: {
    emailReminders: boolean;
    taskNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
