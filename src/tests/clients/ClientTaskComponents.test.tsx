
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';
import ClientAdHocTaskList from '@/components/clients/ClientAdHocTaskList';
import { RecurringTask, TaskInstance } from '@/types/task';

// Mock data for testing
const mockRecurringTasks: RecurringTask[] = [
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
  }
];

const mockAdHocTasks: TaskInstance[] = [
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

describe('ClientRecurringTaskList', () => {
  test('renders recurring tasks correctly', () => {
    render(<ClientRecurringTaskList tasks={mockRecurringTasks} />);
    
    expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Tax Filing')).toBeInTheDocument();
  });

  test('filters tasks based on search term', () => {
    render(<ClientRecurringTaskList tasks={mockRecurringTasks} />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'tax' } });
    
    expect(screen.queryByText('Monthly Bookkeeping')).not.toBeInTheDocument();
    expect(screen.getByText('Quarterly Tax Filing')).toBeInTheDocument();
  });

  test('sorts tasks correctly', () => {
    render(<ClientRecurringTaskList tasks={mockRecurringTasks} />);
    
    // Change sort order
    const sortOrderButton = screen.getByText('A→Z');
    fireEvent.click(sortOrderButton);
    
    // Check if tasks are sorted in descending order
    const taskRows = screen.getAllByRole('row').slice(1); // Skip the header row
    expect(taskRows[0]).toHaveTextContent('Quarterly Tax Filing');
    expect(taskRows[1]).toHaveTextContent('Monthly Bookkeeping');
  });

  test('displays empty state when no tasks are provided', () => {
    render(<ClientRecurringTaskList tasks={[]} />);
    
    expect(screen.getByText('No Recurring Tasks')).toBeInTheDocument();
  });

  test('calls onViewTask callback when task is clicked', () => {
    const mockViewTask = jest.fn();
    render(<ClientRecurringTaskList tasks={mockRecurringTasks} onViewTask={mockViewTask} />);
    
    const taskRow = screen.getByText('Monthly Bookkeeping').closest('tr');
    fireEvent.click(taskRow!);
    
    expect(mockViewTask).toHaveBeenCalledWith('task1');
  });
});

describe('ClientAdHocTaskList', () => {
  test('renders ad-hoc tasks correctly', () => {
    render(<ClientAdHocTaskList tasks={mockAdHocTasks} />);
    
    expect(screen.getByText('Special Advisory Project')).toBeInTheDocument();
    expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
  });

  test('filters tasks based on search term', () => {
    render(<ClientAdHocTaskList tasks={mockAdHocTasks} />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'emergency' } });
    
    expect(screen.queryByText('Special Advisory Project')).not.toBeInTheDocument();
    expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
  });

  test('filters tasks by status', () => {
    render(<ClientAdHocTaskList tasks={mockAdHocTasks} />);
    
    // Open the status dropdown and select "In Progress"
    const statusSelect = screen.getByDisplayValue('All');
    fireEvent.click(statusSelect);
    fireEvent.click(screen.getByText('In Progress'));
    
    expect(screen.queryByText('Special Advisory Project')).not.toBeInTheDocument();
    expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
  });

  test('displays empty state when no tasks are provided', () => {
    render(<ClientAdHocTaskList tasks={[]} />);
    
    expect(screen.getByText('No Ad-hoc Tasks')).toBeInTheDocument();
  });

  test('calls onViewTask callback when task is clicked', () => {
    const mockViewTask = jest.fn();
    render(<ClientAdHocTaskList tasks={mockAdHocTasks} onViewTask={mockViewTask} />);
    
    const taskRow = screen.getByText('Special Advisory Project').closest('tr');
    fireEvent.click(taskRow!);
    
    expect(mockViewTask).toHaveBeenCalledWith('task3');
  });
});
