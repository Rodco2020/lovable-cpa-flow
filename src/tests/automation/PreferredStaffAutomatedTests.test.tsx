
/**
 * PHASE 5: Automated Testing Suite for Preferred Staff Component
 * 
 * Comprehensive automated tests to catch regressions and ensure reliability
 * across all scenarios and edge cases.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreferredStaffField } from '@/components/clients/EditRecurringTaskDialog/components/PreferredStaffField';
import { useForm, FormProvider } from 'react-hook-form';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { EditTaskFormValues } from '@/components/clients/EditRecurringTaskDialog/types';

jest.mock('@/services/staff/staffDropdownService');
const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;

const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  defaultValues?: Partial<EditTaskFormValues> 
}> = ({ children, defaultValues = {} }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const form = useForm<EditTaskFormValues>({
    defaultValues: {
      name: '',
      preferredStaffId: null,
      ...defaultValues
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <form>{children}</form>
      </FormProvider>
    </QueryClientProvider>
  );
};

const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' },
  { id: 'staff-3', full_name: 'Bob Wilson' },
  { id: 'staff-4', full_name: 'Alice Cooper' }
];

describe('PHASE 5: Automated Preferred Staff Testing Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
  });

  describe('Unit Tests - Component Behavior', () => {
    test('AUTO: Component renders with correct initial state', async () => {
      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Select preferred staff member')).toBeInTheDocument();
      });

      console.log('✅ AUTO: Component renders with correct initial state');
    });

    test('AUTO: Dropdown populates with staff options', async () => {
      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      });

      console.log('✅ AUTO: Dropdown populates with staff options');
    });

    test('AUTO: Staff selection updates form value correctly', async () => {
      const TestComponent = () => {
        const form = useForm<EditTaskFormValues>({
          defaultValues: { preferredStaffId: null }
        });

        return (
          <TestWrapper>
            <PreferredStaffField form={form} />
            <div data-testid="form-value">{form.watch('preferredStaffId') || 'null'}</div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Jane Smith'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('staff-2');
      });

      console.log('✅ AUTO: Staff selection updates form value correctly');
    });

    test('AUTO: No preference selection sets null value', async () => {
      const TestComponent = () => {
        const form = useForm<EditTaskFormValues>({
          defaultValues: { preferredStaffId: 'staff-1' }
        });

        return (
          <TestWrapper>
            <PreferredStaffField form={form} />
            <div data-testid="form-value">{form.watch('preferredStaffId') || 'null'}</div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('staff-1');
      });

      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('No preference'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('null');
      });

      console.log('✅ AUTO: No preference selection sets null value');
    });
  });

  describe('Edge Case Tests', () => {
    test('AUTO: Handles empty staff list gracefully', async () => {
      mockGetActiveStaffForDropdown.mockResolvedValueOnce([]);

      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });

      console.log('✅ AUTO: Handles empty staff list gracefully');
    });

    test('AUTO: Handles invalid initial staff ID', async () => {
      const TestComponent = () => {
        const form = useForm<EditTaskFormValues>({
          defaultValues: { preferredStaffId: 'invalid-staff-id' }
        });

        return (
          <TestWrapper>
            <PreferredStaffField form={form} />
            <div data-testid="form-value">{form.watch('preferredStaffId') || 'null'}</div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText(/Selected staff member is no longer available/i)).toBeInTheDocument();
      });

      // Should auto-reset to null
      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('null');
      });

      console.log('✅ AUTO: Handles invalid initial staff ID');
    });

    test('AUTO: Network error shows appropriate message', async () => {
      mockGetActiveStaffForDropdown.mockRejectedValueOnce(new Error('Network timeout'));

      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Retry')).toBeInTheDocument();

      console.log('✅ AUTO: Network error shows appropriate message');
    });

    test('AUTO: Retry functionality works correctly', async () => {
      let callCount = 0;
      mockGetActiveStaffForDropdown.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(mockStaffOptions);
      });

      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.queryByText(/Failed to load staff data/i)).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      console.log('✅ AUTO: Retry functionality works correctly');
    });
  });

  describe('Integration Tests', () => {
    test('AUTO: Form submission includes correct staff ID', async () => {
      const TestComponent = () => {
        const form = useForm<EditTaskFormValues>({
          defaultValues: { preferredStaffId: null, name: 'Test Task' }
        });

        const handleSubmit = (data: EditTaskFormValues) => {
          // Simulate form submission
          expect(data.preferredStaffId).toBe('staff-3');
          expect(data.name).toBe('Test Task');
          console.log('✅ AUTO: Form submission includes correct staff ID');
        };

        return (
          <TestWrapper>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <PreferredStaffField form={form} />
              <button type="submit">Submit</button>
            </form>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Bob Wilson'));

      await act(async () => {
        fireEvent.click(screen.getByText('Submit'));
      });
    });

    test('AUTO: Multiple state changes work correctly', async () => {
      const TestComponent = () => {
        const form = useForm<EditTaskFormValues>({
          defaultValues: { preferredStaffId: null }
        });

        return (
          <TestWrapper>
            <PreferredStaffField form={form} />
            <div data-testid="form-value">{form.watch('preferredStaffId') || 'null'}</div>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      // Select first staff
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('staff-1');
      });

      // Change to different staff
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Alice Cooper'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('staff-4');
      });

      // Change to no preference
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('No preference'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('null');
      });

      console.log('✅ AUTO: Multiple state changes work correctly');
    });
  });

  describe('Accessibility Tests', () => {
    test('AUTO: Component is accessible via keyboard', async () => {
      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      const combobox = screen.getByRole('combobox');
      
      // Test keyboard navigation
      combobox.focus();
      expect(combobox).toHaveFocus();

      fireEvent.keyDown(combobox, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
      });

      console.log('✅ AUTO: Component is accessible via keyboard');
    });

    test('AUTO: Has proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeEnabled();
      });

      const combobox = screen.getByRole('combobox', { name: /preferred staff/i });
      expect(combobox).toBeInTheDocument();

      console.log('✅ AUTO: Has proper ARIA labels');
    });
  });
});
