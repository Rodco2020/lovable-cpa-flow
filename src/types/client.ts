
export type ClientStatus = "Active" | "Inactive" | "Pending" | "Archived";
export type PaymentTerms = "Net30" | "Net15" | "Net45" | "Net60" | "Due on Receipt";
export type BillingFrequency = "Monthly" | "Quarterly" | "Annually" | "Biweekly";
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

export interface NotificationPreferences {
  emailReminders: boolean;
  taskNotifications: boolean;
}

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
  defaultTaskPriority: "Low" | "Medium" | "High" | "Urgent";
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientCreateParams = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type ClientUpdateParams = Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>;
