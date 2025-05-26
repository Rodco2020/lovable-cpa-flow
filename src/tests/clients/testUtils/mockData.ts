
/**
 * Shared mock data for client task component tests
 */

import { RecurringTask, TaskInstance } from '@/types/task';

export const mockRecurringTasks: RecurringTask[] = [
  {
    id: 'task1',
    templateId: 'template1',
    clientId: 'client1',
    name: 'Monthly Bookkeeping',
    description: 'Reconcile accounts and prepare monthly financial statements',
    estimatedHours: 3,
    requiredSkills: ['Junior', 'Bookkeeping'],
    priority: 'Medium',
    category: 'Bookkeeping',
    status: 'Unscheduled',
    dueDate: new Date('2023-06-15'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    recurrencePattern: {
      type: 'Monthly',
      dayOfMonth: 15
    },
    lastGeneratedDate: null,
    isActive: true
  },
  {
    id: 'task2',
    templateId: 'template2',
    clientId: 'client1',
    name: 'Quarterly Tax Filing',
    description: 'Prepare and submit quarterly tax returns',
    estimatedHours: 5,
    requiredSkills: ['Senior', 'Tax Specialist'],
    priority: 'High',
    category: 'Tax',
    status: 'Unscheduled',
    dueDate: new Date('2023-07-15'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    recurrencePattern: {
      type: 'Quarterly',
      dayOfMonth: 15
    },
    lastGeneratedDate: null,
    isActive: true
  },
  {
    id: 'task3-inactive',
    templateId: 'template3',
    clientId: 'client1',
    name: 'Annual Audit',
    description: 'Annual compliance audit',
    estimatedHours: 20,
    requiredSkills: ['Senior', 'Audit'],
    priority: 'Medium',
    category: 'Audit',
    status: 'Unscheduled',
    dueDate: new Date('2023-12-31'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    recurrencePattern: {
      type: 'Annually',
      monthOfYear: 12,
      dayOfMonth: 31
    },
    lastGeneratedDate: null,
    isActive: false
  }
];

export const mockAdHocTasks: TaskInstance[] = [
  {
    id: 'task3',
    templateId: 'template3',
    clientId: 'client1',
    name: 'Special Advisory Project',
    description: 'One-time strategic advisory session',
    estimatedHours: 10,
    requiredSkills: ['CPA', 'Advisory'],
    priority: 'Medium',
    category: 'Advisory',
    status: 'Scheduled',
    dueDate: new Date('2023-06-20'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    scheduledStartTime: new Date('2023-06-20T09:00:00'),
    scheduledEndTime: new Date('2023-06-20T19:00:00')
  },
  {
    id: 'task4',
    templateId: 'template4',
    clientId: 'client1',
    name: 'Emergency Tax Consultation',
    description: 'Urgent consultation regarding tax implications',
    estimatedHours: 2,
    requiredSkills: ['CPA', 'Tax Specialist'],
    priority: 'Urgent',
    category: 'Tax',
    status: 'In Progress',
    dueDate: new Date('2023-05-30'),
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15')
  }
];

export const createTasksWithDifferentDueDates = () => [
  {
    ...mockAdHocTasks[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday
    name: 'Past Due Task'
  },
  {
    ...mockAdHocTasks[1],
    dueDate: new Date(), // today
    name: 'Due Today Task'
  },
  {
    ...mockAdHocTasks[1],
    id: 'task-future',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
    name: 'Upcoming Task'
  }
];
