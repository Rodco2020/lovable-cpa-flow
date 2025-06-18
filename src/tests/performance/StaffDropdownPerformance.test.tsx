
/**
 * PHASE 5: Performance Testing for Staff Dropdown Component
 * 
 * Validates that the preferred staff dropdown doesn't impact form performance
 * and works efficiently with large datasets.
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

describe('PHASE 5: Staff Dropdown Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('PERFORMANCE: Renders quickly with small staff list', async () => {
    const smallStaffList = [
      { id: 'staff-1', full_name: 'John Doe' },
      { id: 'staff-2', full_name: 'Jane Smith' },
      { id: 'staff-3', full_name: 'Bob Wilson' }
    ];

    mockGetActiveStaffForDropdown.mockResolvedValue(smallStaffList);

    const startTime = performance.now();

    render(
      <TestWrapper>
        <PreferredStaffField form={useForm<EditTaskFormValues>()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(500);
    console.log(`✅ Small staff list render time: ${renderTime.toFixed(2)}ms`);
  });

  test('PERFORMANCE: Handles medium staff list efficiently', async () => {
    const mediumStaffList = Array.from({ length: 50 }, (_, i) => ({
      id: `staff-${i}`,
      full_name: `Staff Member ${i}`
    }));

    mockGetActiveStaffForDropdown.mockResolvedValue(mediumStaffList);

    const startTime = performance.now();

    render(
      <TestWrapper>
        <PreferredStaffField form={useForm<EditTaskFormValues>()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000);
    console.log(`✅ Medium staff list render time: ${renderTime.toFixed(2)}ms`);
  });

  test('PERFORMANCE: Scales well with large staff list', async () => {
    const largeStaffList = Array.from({ length: 200 }, (_, i) => ({
      id: `staff-${i}`,
      full_name: `Staff Member ${i.toString().padStart(3, '0')}`
    }));

    mockGetActiveStaffForDropdown.mockResolvedValue(largeStaffList);

    const startTime = performance.now();

    render(
      <TestWrapper>
        <PreferredStaffField form={useForm<EditTaskFormValues>()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
    });

    const initialRenderTime = performance.now() - startTime;

    // Test dropdown opening performance
    const dropdownStartTime = performance.now();
    
    fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Staff Member 000')).toBeInTheDocument();
    });

    const dropdownOpenTime = performance.now() - dropdownStartTime;

    // Test selection performance
    const selectionStartTime = performance.now();
    
    fireEvent.click(screen.getByText('Staff Member 050'));
    
    await waitFor(() => {
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Staff Member 050');
    });

    const selectionTime = performance.now() - selectionStartTime;

    // Performance expectations
    expect(initialRenderTime).toBeLessThan(2000);
    expect(dropdownOpenTime).toBeLessThan(1000);
    expect(selectionTime).toBeLessThan(500);

    console.log(`✅ Large staff list performance:
      - Initial render: ${initialRenderTime.toFixed(2)}ms
      - Dropdown open: ${dropdownOpenTime.toFixed(2)}ms
      - Selection: ${selectionTime.toFixed(2)}ms`);
  });

  test('PERFORMANCE: Memory usage remains stable with multiple renders', async () => {
    const staffList = Array.from({ length: 100 }, (_, i) => ({
      id: `staff-${i}`,
      full_name: `Staff Member ${i}`
    }));

    mockGetActiveStaffForDropdown.mockResolvedValue(staffList);

    // Measure multiple render cycles
    const renderTimes: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();

      const { unmount } = render(
        <TestWrapper>
          <PreferredStaffField form={useForm<EditTaskFormValues>()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
      });

      const endTime = performance.now();
      renderTimes.push(endTime - startTime);

      unmount();
    }

    // Check that render times don't significantly increase
    const firstRender = renderTimes[0];
    const lastRender = renderTimes[renderTimes.length - 1];
    const averageRender = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;

    expect(lastRender).toBeLessThan(firstRender * 1.5); // No more than 50% increase
    expect(averageRender).toBeLessThan(2000);

    console.log(`✅ Memory stability test:
      - First render: ${firstRender.toFixed(2)}ms
      - Last render: ${lastRender.toFixed(2)}ms
      - Average: ${averageRender.toFixed(2)}ms`);
  });

  test('PERFORMANCE: Network error handling doesn\'t impact performance', async () => {
    // Mock network error
    mockGetActiveStaffForDropdown.mockRejectedValue(new Error('Network timeout'));

    const startTime = performance.now();

    render(
      <TestWrapper>
        <PreferredStaffField form={useForm<EditTaskFormValues>()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const errorRenderTime = endTime - startTime;

    expect(errorRenderTime).toBeLessThan(1000);
    console.log(`✅ Error state render time: ${errorRenderTime.toFixed(2)}ms`);
  });

  test('PERFORMANCE: Retry functionality performs efficiently', async () => {
    let callCount = 0;
    mockGetActiveStaffForDropdown.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve([
        { id: 'staff-1', full_name: 'John Doe' },
        { id: 'staff-2', full_name: 'Jane Smith' }
      ]);
    });

    render(
      <TestWrapper>
        <PreferredStaffField form={useForm<EditTaskFormValues>()} />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
    });

    // Test retry performance
    const retryStartTime = performance.now();
    
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.queryByText(/Failed to load staff data/i)).not.toBeInTheDocument();
    });

    const retryTime = performance.now() - retryStartTime;

    expect(retryTime).toBeLessThan(1000);
    console.log(`✅ Retry functionality time: ${retryTime.toFixed(2)}ms`);
  });
});
