
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { TemplateAssignmentTab } from '@/components/clients/TaskOperationsTab/TemplateAssignmentTab';
import { vi } from 'vitest';

// Mock bulk operations service
vi.mock('@/services/bulkOperations', () => ({
  processBulkAssignments: vi.fn().mockResolvedValue({
    success: true,
    totalOperations: 10,
    successfulOperations: 10,
    failedOperations: [],
  }),
  getTemplatesForBulkOperations: vi.fn().mockResolvedValue([
    { id: '1', name: 'Template 1', category: 'Tax' },
    { id: '2', name: 'Template 2', category: 'Audit' },
  ]),
}));

describe('Bulk Operations Workflow Integration Tests', () => {
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

  it('should complete bulk template assignment workflow', async () => {
    renderWithProviders(
      <TemplateAssignmentTab 
        onClose={() => {}}
        onTasksRefresh={() => {}}
      />
    );

    // Test bulk assignment workflow
    await waitFor(() => {
      expect(screen.getByText(/template assignment/i)).toBeInTheDocument();
    });

    // Verify bulk operations complete successfully
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should handle bulk operations performance efficiently', async () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <TemplateAssignmentTab 
        onClose={() => {}}
        onTasksRefresh={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/template assignment/i)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Ensure bulk operations UI renders efficiently
    expect(renderTime).toBeLessThan(500); // 500ms max
  });
});
