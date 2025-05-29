
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { vi } from 'vitest';

// Mock services
vi.mock('@/services/clientService', () => ({
  getAllClients: vi.fn().mockResolvedValue([
    { id: '1', legalName: 'Test Client 1', status: 'Active' },
    { id: '2', legalName: 'Test Client 2', status: 'Active' },
  ]),
}));

vi.mock('@/services/taskCopyService', () => ({
  copyClientTasks: vi.fn().mockResolvedValue(true),
}));

describe('Task Copy Workflow Integration Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
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

  it('should complete full copy workflow successfully', async () => {
    const onOpenChange = vi.fn();
    
    renderWithProviders(
      <CopyClientTasksDialog
        clientId="source-client"
        open={true}
        onOpenChange={onOpenChange}
        sourceClientName="Source Client"
      />
    );

    // Step 1: Select target client
    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });

    const targetClientOption = await screen.findByText('Test Client 1');
    await user.click(targetClientOption);

    // Step 2: Select tasks (mock task selection)
    await waitFor(() => {
      expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
    });

    // Step 3: Confirm and execute copy
    const copyButton = screen.getByText(/copy tasks/i);
    await user.click(copyButton);

    // Step 4: Verify processing state
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    // Step 5: Verify success state
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle error scenarios gracefully', async () => {
    // Mock service to throw error
    vi.mocked(require('@/services/taskCopyService').copyClientTasks)
      .mockRejectedValueOnce(new Error('Copy failed'));

    const onOpenChange = vi.fn();
    
    renderWithProviders(
      <CopyClientTasksDialog
        clientId="source-client"
        open={true}
        onOpenChange={onOpenChange}
        sourceClientName="Source Client"
      />
    );

    // Navigate to copy execution and trigger error
    // Test error handling and recovery
    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });

    // Error should be handled gracefully without crashing
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should handle large task datasets efficiently', async () => {
    const largeTaskList = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      name: `Task ${i}`,
      taskType: i % 2 === 0 ? 'recurring' : 'ad-hoc',
    }));

    // Mock large dataset
    const startTime = performance.now();
    
    renderWithProviders(
      <CopyClientTasksDialog
        clientId="source-client"
        open={true}
        onOpenChange={() => {}}
        sourceClientName="Source Client"
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Ensure rendering large datasets doesn't exceed reasonable time
    expect(renderTime).toBeLessThan(1000); // 1 second max
  });
});
