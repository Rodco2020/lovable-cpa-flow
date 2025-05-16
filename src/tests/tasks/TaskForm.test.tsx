
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '@/components/tasks/TaskForm';
import { toast } from 'sonner';
import { createRecurringTask, createAdHocTask, getTaskTemplates } from '@/services/taskService';
import { getAllClients } from '@/services/clientService';

// Mock the necessary dependencies
jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(() => 'mock-toast-id'),
    dismiss: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/services/taskService', () => ({
  getTaskTemplates: jest.fn(),
  createRecurringTask: jest.fn(),
  createAdHocTask: jest.fn()
}));

jest.mock('@/services/clientService', () => ({
  getAllClients: jest.fn()
}));

/**
 * Test suite for the TaskForm component
 * 
 * This suite tests the complete user flow from loading resources to form submission,
 * including validation, error handling, and successful task creation scenarios.
 */
describe('TaskForm Component', () => {
  // Mock data for tests
  const mockTemplates = [
    {
      id: 'template1',
      name: 'Tax Return',
      description: 'Annual tax filing',
      defaultEstimatedHours: 2,
      requiredSkills: ['CPA', 'Tax Specialist'],
      defaultPriority: 'Medium',
      category: 'Tax',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    },
    {
      id: 'template2',
      name: 'Monthly Bookkeeping',
      description: 'Regular bookkeeping services',
      defaultEstimatedHours: 3,
      requiredSkills: ['Bookkeeping'],
      defaultPriority: 'Medium',
      category: 'Bookkeeping',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
  ];

  const mockClients = [
    {
      id: 'client1',
      legalName: 'Acme Inc',
      primaryContact: 'John Doe',
      email: 'john@acme.com',
      phone: '555-1234',
      billingAddress: '123 Main St',
      industry: 'Technology',
      status: 'Active',
      expectedMonthlyRevenue: 1000,
      paymentTerms: 'Net 30',
      billingFrequency: 'Monthly',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'client2',
      legalName: 'XYZ Corp',
      primaryContact: 'Jane Smith',
      email: 'jane@xyz.com',
      phone: '555-5678',
      billingAddress: '456 Oak St',
      industry: 'Manufacturing',
      status: 'Active',
      expectedMonthlyRevenue: 2000,
      paymentTerms: 'Net 15',
      billingFrequency: 'Monthly',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    (getAllClients as jest.Mock).mockResolvedValue(mockClients);
    (createRecurringTask as jest.Mock).mockResolvedValue({ id: 'task1' });
    (createAdHocTask as jest.Mock).mockResolvedValue({ id: 'task2' });
  });

  /**
   * Test initial loading state
   */
  test('renders loading state initially', () => {
    render(<TaskForm onClose={jest.fn()} />);
    expect(screen.getByText('Loading resources...')).toBeInTheDocument();
  });

  /**
   * Test resources loading on component mount
   */
  test('loads templates and clients on mount', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(getTaskTemplates).toHaveBeenCalled();
      expect(getAllClients).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
  });

  /**
   * Test template selection and auto-population of values
   */
  test('handles template selection and auto-populates values', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    expect(screen.getByLabelText(/Task Name/i)).toHaveValue('Tax Return');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Annual tax filing');
    expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue('2');
  });

  /**
   * Test client selection
   */
  test('handles client selection', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Select client
    const clientSelect = screen.getByText('Select a client');
    fireEvent.click(clientSelect);
    fireEvent.click(screen.getByText('Acme Inc'));
  });

  /**
   * Test recurring task toggle
   */
  test('toggles recurring task interface', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Select template first to reveal recurring checkbox
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Toggle recurring task checkbox
    const recurringCheckbox = screen.getByLabelText(/This is a recurring task/i);
    fireEvent.click(recurringCheckbox);
    
    // Check that recurring-specific fields appear
    expect(screen.getByLabelText(/First Due Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recurrence Pattern/i)).toBeInTheDocument();
  });

  /**
   * Test recurrence pattern selection
   */
  test('shows appropriate fields based on recurrence pattern', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Select template
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Enable recurring task
    const recurringCheckbox = screen.getByLabelText(/This is a recurring task/i);
    fireEvent.click(recurringCheckbox);
    
    // Test different recurrence patterns
    const recurrenceSelect = screen.getByLabelText(/Recurrence Pattern/i);
    
    // Test Weekly pattern
    fireEvent.change(recurrenceSelect, { target: { value: 'Weekly' } });
    expect(screen.getByText(/On which days/i)).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    
    // Test Monthly pattern
    fireEvent.change(recurrenceSelect, { target: { value: 'Monthly' } });
    expect(screen.getByLabelText(/Day of Month/i)).toBeInTheDocument();
    
    // Test Annually pattern
    fireEvent.change(recurrenceSelect, { target: { value: 'Annually' } });
    expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
  });

  /**
   * Test validation errors
   */
  test('displays validation errors when form is incomplete', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Fill incomplete form - select template but no client or date
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Ad-hoc Task');
    fireEvent.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith("Please fix the form errors before submitting");
    expect(createAdHocTask).not.toHaveBeenCalled();
    expect(createRecurringTask).not.toHaveBeenCalled();
  });

  /**
   * Test successful ad-hoc task submission
   */
  test('submits ad-hoc task form successfully', async () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();
    
    render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Fill out the form
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Select client
    const clientSelect = screen.getByText('Select a client');
    fireEvent.click(clientSelect);
    fireEvent.click(screen.getByText('Acme Inc'));
    
    // Set due date
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-15' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Ad-hoc Task');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createAdHocTask).toHaveBeenCalledWith(expect.objectContaining({
        templateId: 'template1',
        clientId: 'client1',
        name: 'Tax Return',
        dueDate: expect.any(Date)
      }));
    });
    
    expect(toast.success).toHaveBeenCalledWith(
      "Ad-hoc task created successfully!",
      expect.anything()
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test successful recurring task submission
   */
  test('submits recurring task form successfully', async () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();
    
    render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Fill out the form
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Select client
    const clientSelect = screen.getByText('Select a client');
    fireEvent.click(clientSelect);
    fireEvent.click(screen.getByText('Acme Inc'));
    
    // Set recurring task
    const recurringCheckbox = screen.getByLabelText(/This is a recurring task/i);
    fireEvent.click(recurringCheckbox);
    
    // Set due date
    const dueDateInput = screen.getByLabelText(/First Due Date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-15' } });
    
    // Select Monthly recurrence and set day of month
    const recurrenceSelect = screen.getByLabelText(/Recurrence Pattern/i);
    fireEvent.change(recurrenceSelect, { target: { value: 'Monthly' } });
    const dayOfMonthInput = screen.getByLabelText(/Day of Month/i);
    fireEvent.change(dayOfMonthInput, { target: { value: '15' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Recurring Task');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createRecurringTask).toHaveBeenCalledWith(expect.objectContaining({
        templateId: 'template1',
        clientId: 'client1',
        name: 'Tax Return',
        recurrencePattern: expect.objectContaining({
          type: 'Monthly',
          dayOfMonth: 15
        })
      }));
    });
    
    expect(toast.success).toHaveBeenCalledWith(
      "Recurring task created successfully!",
      expect.anything()
    );
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test API error handling
   */
  test('handles API errors properly', async () => {
    (createAdHocTask as jest.Mock).mockRejectedValue(new Error("API Error"));
    
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    // Fill out the form
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    // Select client
    const clientSelect = screen.getByText('Select a client');
    fireEvent.click(clientSelect);
    fireEvent.click(screen.getByText('Acme Inc'));
    
    // Set due date
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-15' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Ad-hoc Task');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An error occurred while creating the task",
        expect.anything()
      );
    });
  });
  
  /**
   * Test resource loading error handling
   */
  test('handles resource loading errors', async () => {
    (getTaskTemplates as jest.Mock).mockRejectedValue(new Error("Failed to load templates"));
    
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load necessary data. Please try again.");
    });
  });
});
