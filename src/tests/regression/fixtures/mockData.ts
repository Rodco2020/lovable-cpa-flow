
/**
 * Mock Data Fixtures for Regression Tests
 * 
 * Centralized mock data creation for consistent testing across all regression test suites.
 */

import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { IndustryType, PaymentTerms, BillingFrequency, ClientStatus } from '@/types/client';

export const createMockClient = () => ({
  id: 'client-1',
  legalName: 'Test Company',
  primaryContact: 'John Doe',
  email: 'john@test.com',
  phone: '555-1234',
  status: 'Active' as ClientStatus,
  industry: 'Technology' as IndustryType,
  billingAddress: '123 Main St',
  expectedMonthlyRevenue: 5000,
  paymentTerms: 'Net30' as PaymentTerms,
  billingFrequency: 'Monthly' as BillingFrequency,
  defaultTaskPriority: 'Medium',
  createdAt: new Date(),
  updatedAt: new Date(),
  notificationPreferences: { emailReminders: true, taskNotifications: true }
});

export const createMockRecurringTasks = (): RecurringTask[] => [
  {
    id: 'task-1',
    templateId: 'template-1',
    clientId: 'client-1',
    name: 'Monthly Bookkeeping',
    description: 'Monthly bookkeeping review',
    estimatedHours: 4,
    requiredSkills: ['bookkeeping'],
    priority: 'Medium' as TaskPriority,
    category: 'Bookkeeping' as TaskCategory,
    status: 'Unscheduled',
    dueDate: new Date('2024-03-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    recurrencePattern: {
      type: 'Monthly',
      interval: 1,
      dayOfMonth: 15
    },
    lastGeneratedDate: null,
    isActive: true,
    preferredStaffId: null
  },
  {
    id: 'task-2',
    templateId: 'template-2',
    clientId: 'client-1',
    name: 'Quarterly Tax Filing',
    description: 'Quarterly tax filing preparation',
    estimatedHours: 8,
    requiredSkills: ['tax-preparation'],
    priority: 'High' as TaskPriority,
    category: 'Tax' as TaskCategory,
    status: 'Unscheduled',
    dueDate: new Date('2024-04-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    recurrencePattern: {
      type: 'Quarterly',
      interval: 1,
      dayOfMonth: 15,
      monthOfYear: 4
    },
    lastGeneratedDate: null,
    isActive: true,
    preferredStaffId: 'staff-1'
  }
];
