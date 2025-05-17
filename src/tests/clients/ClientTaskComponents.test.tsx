
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this import to extend Jest matchers
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';
import ClientAdHocTaskList from '@/components/clients/ClientAdHocTaskList';
import { RecurringTask, TaskInstance } from '@/types/task';

// Mock the components used by ClientRecurringTaskList
jest.mock('@/components/clients/EditRecurringTaskContainer', () => ({
  EditRecurringTaskContainer: ({ open, onOpenChange, taskId }) => (
    <div data-testid="edit-task-dialog" data-open={open} data-task-id={taskId}>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  )
}));

// Mock the taskService module
jest.mock('@/services/taskService', () => ({
  getRecurringTasks: jest.fn().mockResolvedValue([]),
  deactivateRecurringTask: jest.fn().mockResolvedValue(true),
  getTaskInstances: jest.fn().mockResolvedValue([])
}));

// Import the mock functions for easier assertions
import { getRecurringTasks, deactivateRecurringTask } from '@/services/taskService';

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

// Mock the pagination component since it's primarily visual
jest.mock('@/components/clients/TaskListPagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button 
        onClick={() => onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
        disabled={currentPage === 1}
        data-testid="prev-page"
      >
        Previous
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">of {totalPages}</span>
      <button 
        onClick={() => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
        disabled={currentPage === totalPages}
        data-testid="next-page"
      >
        Next
      </button>
    </div>
  )
}));

describe('ClientRecurringTaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the function to return our test data
    (getRecurringTasks as jest.Mock).mockResolvedValue(mockRecurringTasks);
  });

  test('renders recurring tasks correctly', async () => {
    render(<ClientRecurringTaskList clientId="client1" />);
    
    // Wait for tasks to load
    await screen.findByText('Monthly Bookkeeping');
    await screen.findByText('Quarterly Tax Filing');
    
    expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Tax Filing')).toBeInTheDocument();
  });

  test('handles deactivation correctly', async () => {
    render(<ClientRecurringTaskList clientId="client1" />);
    
    // Wait for tasks to load
    await screen.findByText('Monthly Bookkeeping');
    
    // Find and click the deactivate button
    const deactivateButtons = screen.getAllByText('Deactivate');
    fireEvent.click(deactivateButtons[0]);
    
    expect(deactivateRecurringTask).toHaveBeenCalledWith('task1');
  });

  test('displays empty state when no tasks are found', async () => {
    (getRecurringTasks as jest.Mock).mockResolvedValue([]);
    
    render(<ClientRecurringTaskList clientId="client1" />);
    
    // Wait for the empty state to appear
    await screen.findByText('No recurring tasks');
    
    expect(screen.getByText('No recurring tasks')).toBeInTheDocument();
    expect(screen.getByText('This client doesn\'t have any recurring tasks set up yet.')).toBeInTheDocument();
  });

  test('calls onViewTask callback when task is clicked', async () => {
    const mockViewTask = jest.fn();
    render(<ClientRecurringTaskList clientId="client1" onViewTask={mockViewTask} />);
    
    // Wait for tasks to load
    await screen.findByText('Monthly Bookkeeping');
    
    // Click on the row
    const taskRow = screen.getByText('Monthly Bookkeeping').closest('tr');
    fireEvent.click(taskRow!);
    
    expect(mockViewTask).toHaveBeenCalledWith('task1');
  });
  
  test('shows pagination when there are more tasks than items per page', async () => {
    // Create more tasks to trigger pagination
    const manyTasks = Array(10).fill(null).map((_, i) => ({
      ...mockRecurringTasks[0],
      id: `task-${i}`,
      name: `Task ${i}`,
    }));
    
    (getRecurringTasks as jest.Mock).mockResolvedValue(manyTasks);
    
    render(<ClientRecurringTaskList clientId="client1" />);
    
    // Wait for tasks to load
    await screen.findByText('Task 0');
    
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  test('opens edit dialog when Edit button is clicked', async () => {
    render(<ClientRecurringTaskList clientId="client1" />);
    
    // Wait for tasks to load
    await screen.findByText('Monthly Bookkeeping');
    
    // Find and click the edit button
    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if edit dialog is open with correct task ID
    const editDialog = screen.getByTestId('edit-task-dialog');
    expect(editDialog).toHaveAttribute('data-open', 'true');
    expect(editDialog).toHaveAttribute('data-task-id', 'task1');
  });
  
  test('clicking Edit button stops event propagation', async () => {
    const mockViewTask = jest.fn();
    render(<ClientRecurringTaskList clientId="client1" onViewTask={mockViewTask} />);
    
    // Wait for tasks to load
    await screen.findByText('Monthly Bookkeeping');
    
    // Find and click the edit button
    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // onViewTask should not be called when edit button is clicked
    expect(mockViewTask).not.toHaveBeenCalled();
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

  test('filters tasks by status with the expanded filter interface', () => {
    render(<ClientAdHocTaskList tasks={mockAdHocTasks} />);
    
    // Open filter popover
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Select In Progress status
    const statusSelect = screen.getByText('All Statuses');
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
  
  test('filters tasks by due date', () => {
    // Create tasks with different due dates
    const tasksWithDifferentDueDates = [
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
    
    render(<ClientAdHocTaskList tasks={tasksWithDifferentDueDates} />);
    
    // Open filter popover
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Filter by today
    const todayButton = screen.getByText('Due Today');
    fireEvent.click(todayButton);
    
    expect(screen.queryByText('Past Due Task')).not.toBeInTheDocument();
    expect(screen.getByText('Due Today Task')).toBeInTheDocument();
    expect(screen.queryByText('Upcoming Task')).not.toBeInTheDocument();
  });
});
