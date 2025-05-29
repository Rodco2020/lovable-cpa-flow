
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { vi } from 'vitest';

// Comprehensive regression test suite
describe('Regression Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock services
    vi.mocked(require('@/services/clientService').getAllClients)
      .mockResolvedValue([
        { id: 'client-1', legalName: 'Test Client 1', status: 'Active' },
        { id: 'client-2', legalName: 'Test Client 2', status: 'Active' },
      ]);

    vi.mocked(require('@/services/taskService').getClientTasks)
      .mockResolvedValue([
        { id: 'task-1', name: 'Task 1', taskType: 'recurring' },
        { id: 'task-2', name: 'Task 2', taskType: 'ad-hoc' },
      ]);

    vi.mocked(require('@/services/taskCopyService').copyClientTasks)
      .mockResolvedValue({
        recurring: [],
        adHoc: []
      });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          {component}
        </TestWrapper>
      </QueryClientProvider>
    );
  };

  describe('Legacy Feature Compatibility', () => {
    it('maintains compatibility with original dialog props', async () => {
      // Test with classic props pattern used in existing code
      renderWithProviders(
        <CopyClientTasksDialog
          clientId="client-1" // Legacy prop
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Dialog should open and function correctly with legacy props
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Should be able to navigate and complete workflow
      const targetClient = await screen.findByText('Test Client 2');
      await user.click(targetClient);
      
      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });
    });

    it('maintains compatibility with new props structure', async () => {
      // Test with new props pattern
      renderWithProviders(
        <CopyClientTasksDialog
          defaultSourceClientId="client-1" // New prop
          open={true}
          onOpenChange={() => {}}
          sourceClientName="Custom Client Name"
        />
      );

      // Dialog should open and display custom name
      await waitFor(() => {
        expect(screen.getByText(/custom client name/i)).toBeInTheDocument();
      });
      
      // Should be able to navigate and complete workflow
      const targetClient = await screen.findByText('Test Client 2');
      await user.click(targetClient);
      
      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Integrity', () => {
    it('preserves client and task data throughout workflow', async () => {
      // Mock with specific test data to trace
      vi.mocked(require('@/services/clientService').getAllClients)
        .mockResolvedValue([
          { id: 'src-1', legalName: 'Source Client', status: 'Active', extraData: 'test-value-1' },
          { id: 'tgt-1', legalName: 'Target Client', status: 'Active', extraData: 'test-value-2' },
        ]);

      vi.mocked(require('@/services/taskService').getClientTasks)
        .mockResolvedValue([
          { id: 'task-trace-1', name: 'Traced Task 1', taskType: 'recurring', metaData: 'trace-data-1' },
          { id: 'task-trace-2', name: 'Traced Task 2', taskType: 'ad-hoc', metaData: 'trace-data-2' },
        ]);

      // Create a spy to verify data integrity
      const copyTasksSpy = vi.fn().mockResolvedValue({
        recurring: [],
        adHoc: []
      });
      
      vi.mocked(require('@/services/taskCopyService').copyClientTasks)
        .mockImplementation(copyTasksSpy);

      renderWithProviders(
        <CopyClientTasksDialog
          defaultSourceClientId="src-1"
          open={true}
          onOpenChange={() => {}}
          sourceClientName="Source Client"
        />
      );

      // Complete the workflow
      await waitFor(() => screen.getByText(/select target client/i));
      
      const targetClient = await screen.findByText('Target Client');
      await user.click(targetClient);
      
      await waitFor(() => screen.getByText(/select tasks/i));
      
      // Select all tasks
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);
      
      // Proceed to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      await waitFor(() => screen.getByText(/confirm/i));
      
      const copyButton = screen.getByRole('button', { name: /copy tasks/i });
      await user.click(copyButton);

      // Verify data integrity maintained through the entire flow
      await waitFor(() => {
        expect(copyTasksSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceClientId: 'src-1',
            targetClientId: 'tgt-1',
            taskIds: expect.arrayContaining(['task-trace-1', 'task-trace-2'])
          })
        );
      });
    });
  });

  describe('Validation Logic', () => {
    it('prevents invalid operations throughout workflow', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          defaultSourceClientId="client-1"
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Try to proceed without selecting target client
      await waitFor(() => screen.getByText(/select target client/i));
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
      
      // Now select a target and proceed
      const targetClient = await screen.findByText('Test Client 2');
      await user.click(targetClient);
      
      await waitFor(() => {
        expect(nextButton).not.toBeDisabled();
      });
      
      await user.click(nextButton);
      
      // Try to proceed without selecting any tasks
      await waitFor(() => screen.getByText(/select tasks/i));
      
      const secondNextButton = screen.getByRole('button', { name: /next/i });
      expect(secondNextButton).toBeDisabled();
    });

    it('maintains validation through component re-renders', async () => {
      const { rerender } = renderWithProviders(
        <CopyClientTasksDialog
          defaultSourceClientId="client-1"
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Select target client
      await waitFor(() => screen.getByText(/select target client/i));
      
      const targetClient = await screen.findByText('Test Client 2');
      await user.click(targetClient);
      
      // Re-render the component (simulating parent component update)
      rerender(
        <QueryClientProvider client={queryClient}>
          <TestWrapper>
            <CopyClientTasksDialog
              defaultSourceClientId="client-1"
              open={true}
              onOpenChange={() => {}}
            />
          </TestWrapper>
        </QueryClientProvider>
      );

      // Validation state should be preserved
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();
      });
    });
  });
});
