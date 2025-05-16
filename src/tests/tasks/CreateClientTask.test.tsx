
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateClientTask from '@/components/tasks/CreateClientTask';
import { RecurringTask } from '@/types/task';

// Mock the TaskForm component since we're testing its integration
jest.mock('@/components/tasks/TaskForm', () => {
  return {
    __esModule: true,
    default: ({ onClose, onSuccess }: { onClose: () => void; onSuccess?: (task: any) => void }) => (
      <div data-testid="mock-task-form">
        <button data-testid="task-form-close" onClick={onClose}>Close</button>
        <button data-testid="task-form-success" onClick={() => onSuccess && onSuccess({ id: 'new-task-id' })}>
          Create Success
        </button>
      </div>
    )
  };
});

/**
 * Test suite for the CreateClientTask component
 * 
 * This suite tests the dialog behavior, task creation flow, and callback handling.
 */
describe('CreateClientTask Component', () => {
  test('renders with assign button', () => {
    render(<CreateClientTask />);
    expect(screen.getByText('Assign New Task')).toBeInTheDocument();
  });

  test('opens dialog when button is clicked', () => {
    render(<CreateClientTask />);
    
    const assignButton = screen.getByText('Assign New Task');
    fireEvent.click(assignButton);
    
    expect(screen.getByTestId('mock-task-form')).toBeInTheDocument();
  });

  test('closes dialog when form close event is triggered', async () => {
    render(<CreateClientTask />);
    
    // Open dialog
    const assignButton = screen.getByText('Assign New Task');
    fireEvent.click(assignButton);
    
    // Simulate task form closing
    const closeButton = screen.getByTestId('task-form-close');
    fireEvent.click(closeButton);
    
    // Dialog should be closed and task form shouldn't be visible
    await waitFor(() => {
      expect(screen.queryByTestId('mock-task-form')).not.toBeInTheDocument();
    });
  });

  test('calls onTaskCreated callback when task is created successfully', async () => {
    const mockOnTaskCreated = jest.fn();
    render(<CreateClientTask onTaskCreated={mockOnTaskCreated} />);
    
    // Open dialog
    const assignButton = screen.getByText('Assign New Task');
    fireEvent.click(assignButton);
    
    // Simulate successful task creation
    const successButton = screen.getByTestId('task-form-success');
    fireEvent.click(successButton);
    
    // Verify callback was called with the new task
    expect(mockOnTaskCreated).toHaveBeenCalledWith({ id: 'new-task-id' });
  });

  test('dialog has the correct title', () => {
    render(<CreateClientTask />);
    
    const assignButton = screen.getByText('Assign New Task');
    fireEvent.click(assignButton);
    
    expect(screen.getByText('Assign Task to Client')).toBeInTheDocument();
  });
});
