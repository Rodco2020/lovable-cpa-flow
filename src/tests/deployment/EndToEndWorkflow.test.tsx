
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { vi } from 'vitest';

// Comprehensive end-to-end workflow testing
describe('End-to-End Workflow Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock all required services
    vi.mocked(require('@/services/clientService').getAllClients)
      .mockResolvedValue([
        { id: 'source-1', legalName: 'Source Client', status: 'Active' },
        { id: 'target-1', legalName: 'Target Client', status: 'Active' },
      ]);

    vi.mocked(require('@/services/taskService').getClientTasks)
      .mockResolvedValue([
        { id: 'task-1', name: 'Test Task', taskType: 'recurring' },
        { id: 'task-2', name: 'Another Task', taskType: 'ad-hoc' },
      ]);

    vi.mocked(require('@/services/taskCopyService').copyClientTasks)
      .mockResolvedValue({
        recurring: [{ id: 'task-1', name: 'Test Task' }],
        adHoc: [{ id: 'task-2', name: 'Another Task' }]
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

  test('Complete copy task workflow', async () => {
    // Setup monitoring
    const performanceEntries: PerformanceMeasure[] = [];
    const originalMeasure = performance.measure;
    performance.measure = vi.fn((name: string, startMark?: string, endMark?: string): PerformanceMeasure => {
      const entry: PerformanceMeasure = { 
        name, 
        startTime: 0, 
        duration: 5, 
        entryType: 'measure', 
        detail: null,
        toJSON: () => ({})
      };
      performanceEntries.push(entry);
      return entry;
    });

    // Start monitoring
    performance.mark('workflow-start');

    // Render component
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-1"
        sourceClientName="Source Client"
      />
    );

    // Step 1: Select target client
    await waitFor(() => screen.getByText(/select target client/i));
    performance.mark('step1-loaded');
    
    const targetOption = await screen.findByText('Target Client');
    await user.click(targetOption);
    performance.mark('step1-completed');

    // Step 2: Select tasks
    await waitFor(() => screen.getByText(/select tasks/i));
    performance.mark('step2-loaded');
    
    // Select all tasks
    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    if (selectAllButton) {
      await user.click(selectAllButton);
    } else {
      // Fallback to selecting individual tasks
      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }
    }
    performance.mark('step2-completed');
    
    // Proceed to next step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 3: Confirmation
    await waitFor(() => screen.getByText(/confirm/i));
    performance.mark('step3-loaded');
    
    const copyButton = screen.getByRole('button', { name: /copy tasks/i });
    await user.click(copyButton);
    performance.mark('step3-completed');

    // Step 4: Processing
    await waitFor(() => screen.getByText(/processing|copying tasks/i));
    performance.mark('step4-loaded');

    // Step 5: Success
    await waitFor(() => screen.getByText(/success|completed successfully/i), { timeout: 5000 });
    performance.mark('step5-loaded');

    // Finish monitoring
    performance.mark('workflow-end');
    performance.measure('total-workflow', 'workflow-start', 'workflow-end');
    performance.measure('step1-duration', 'step1-loaded', 'step1-completed');
    performance.measure('step2-duration', 'step2-loaded', 'step2-completed');
    performance.measure('step3-duration', 'step3-loaded', 'step3-completed');
    performance.measure('step4-duration', 'step4-loaded', 'step5-loaded');

    // Verify workflow completed successfully
    expect(screen.getByText(/success|completed successfully/i)).toBeInTheDocument();
    
    // Clean up
    performance.measure = originalMeasure;

    // Performance metrics should be recorded
    expect(performanceEntries.length).toBeGreaterThan(0);
  });

  test('Handles network errors during workflow', async () => {
    // Mock network failure
    vi.mocked(require('@/services/taskCopyService').copyClientTasks)
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-1"
        sourceClientName="Source Client"
      />
    );

    // Step 1: Select target client
    await waitFor(() => screen.getByText(/select target client/i));
    const targetOption = await screen.findByText('Target Client');
    await user.click(targetOption);

    // Step 2: Select tasks and proceed to confirmation
    await waitFor(() => screen.getByText(/select tasks/i));
    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    await user.click(selectAllButton);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 3: Confirmation and trigger copy
    await waitFor(() => screen.getByText(/confirm/i));
    const copyButton = screen.getByRole('button', { name: /copy tasks/i });
    await user.click(copyButton);

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error|failed|unsuccessful/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should be able to retry
    const retryButton = screen.getByRole('button', { name: /retry|try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  test('Supports cancellation at any step', async () => {
    let dialogClosed = false;
    
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => { dialogClosed = true; }}
        defaultSourceClientId="source-1"
        sourceClientName="Source Client"
      />
    );

    // Step 1: Select target client
    await waitFor(() => screen.getByText(/select target client/i));
    
    // Find and click cancel/close button
    const closeButtons = screen.getAllByRole('button');
    const cancelButton = closeButtons.find(button => 
      button.textContent?.toLowerCase().includes('cancel') || 
      button.textContent?.toLowerCase().includes('close')
    );
    
    if (cancelButton) {
      await user.click(cancelButton);
      expect(dialogClosed).toBe(true);
    } else {
      // Alternative: click the dialog close button (X) if available
      const closeIcon = screen.getByRole('button', { name: /close/i });
      if (closeIcon) {
        await user.click(closeIcon);
        expect(dialogClosed).toBe(true);
      }
    }
  });
});
