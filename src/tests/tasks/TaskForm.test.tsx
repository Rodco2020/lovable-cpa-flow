
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

describe('TaskForm Component', () => {
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
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    (getAllClients as jest.Mock).mockResolvedValue(mockClients);
    (createRecurringTask as jest.Mock).mockResolvedValue({ id: 'task1' });
    (createAdHocTask as jest.Mock).mockResolvedValue({ id: 'task2' });
  });

  test('renders loading state initially', () => {
    render(<TaskForm onClose={jest.fn()} />);
    expect(screen.getByText('Loading resources...')).toBeInTheDocument();
  });

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

  test('handles template selection', async () => {
    render(<TaskForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();
    });
    
    const templateSelect = screen.getByLabelText(/Select Task Template/i);
    fireEvent.change(templateSelect, { target: { value: 'template1' } });
    
    expect(screen.getByLabelText(/Task Name/i)).toHaveValue('Tax Return');
  });

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
      }));
    });
    
    expect(toast.success).toHaveBeenCalledWith(
      "Ad-hoc task created successfully!",
      expect.anything()
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

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
    
    // Submit the form
    const submitButton = screen.getByText('Create Recurring Task');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createRecurringTask).toHaveBeenCalledWith(expect.objectContaining({
        templateId: 'template1',
        clientId: 'client1',
        name: 'Tax Return',
        recurrencePattern: expect.any(Object)
      }));
    });
    
    expect(toast.success).toHaveBeenCalledWith(
      "Recurring task created successfully!",
      expect.anything()
    );
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles validation errors', async () => {
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

  test('handles api errors', async () => {
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
});
