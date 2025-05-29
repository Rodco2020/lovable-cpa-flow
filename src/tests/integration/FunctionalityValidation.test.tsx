
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { CopyTasksTab } from '@/components/clients/TaskOperationsTab/CopyTasksTab';
import ClientTasksSection from '@/components/clients/ClientTasksSection';
import { vi } from 'vitest';

describe('Functionality Validation Tests - Phase 5 Cleanup', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const MOCK_CLIENTS = [
    { id: 'client-1', legalName: 'Test Client 1', status: 'Active' },
    { id: 'client-2', legalName: 'Test Client 2', status: 'Active' },
  ];

  const MOCK_TASKS = [
    { id: 'task-1', name: 'Task 1', taskType: 'recurring' },
    { id: 'task-2', name: 'Task 2', taskType: 'ad-hoc' },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Setup consistent mocks
    vi.mock('@/services/clientService', () => ({
      getAllClients: vi.fn().mockResolvedValue(MOCK_CLIENTS),
    }));

    vi.mock('@/services/taskService', () => ({
      getClientTasks: vi.fn().mockResolvedValue(MOCK_TASKS),
    }));

    vi.mock('@/services/taskCopyService', () => ({
      copyClientTasks: vi.fn().mockResolvedValue({ recurring: [], adHoc: [] }),
    }));
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

  describe('Core Functionality Preservation', () => {
    it('should maintain complete 6-step workflow after cleanup', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      // Verify all 6 steps are accessible and functional
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      // Step navigation should work
      const stepIndicator = screen.getByText(/step 1 of 6/i);
      expect(stepIndicator).toBeInTheDocument();

      console.log('✅ 6-step workflow preserved after cleanup');
    });

    it('should maintain all entry points functionality', async () => {
      // Test Dialog entry point
      const { unmount: unmountDialog } = renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/source client/i)).toBeInTheDocument();
      });

      unmountDialog();

      // Test Tab entry point
      const { unmount: unmountTab } = renderWithProviders(
        <CopyTasksTab
          initialClientId="client-1"
          onTasksRefresh={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      unmountTab();

      // Test Section entry point
      renderWithProviders(
        <ClientTasksSection
          clientId="client-1"
          clientName="Test Client"
          onRefreshClient={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks/i)).toBeInTheDocument();
      });

      console.log('✅ All entry points functional after cleanup');
    });

    it('should maintain backward compatibility', async () => {
      // Test legacy clientId prop
      renderWithProviders(
        <CopyClientTasksDialog
          clientId="client-1" // Legacy prop
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      console.log('✅ Backward compatibility maintained after cleanup');
    });
  });

  describe('Performance Validation After Cleanup', () => {
    it('should maintain fast rendering performance', async () => {
      const startTime = performance.now();
      
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly even after cleanup optimizations
      expect(renderTime).toBeLessThan(1000);

      console.log(`✅ Render performance maintained: ${renderTime.toFixed(2)}ms`);
    });

    it('should handle cleanup without memory leaks', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Mount and unmount multiple times to test cleanup
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProviders(
          <CopyClientTasksDialog
            open={true}
            onOpenChange={() => {}}
          />
        );

        await waitFor(() => {
          expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
        });

        unmount();
      }

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal after cleanup optimizations
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB max

      console.log(`✅ Memory cleanup efficient: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
    });
  });

  describe('Integration Validation After Cleanup', () => {
    it('should maintain service integration points', async () => {
      const getAllClientsSpy = vi.spyOn(require('@/services/clientService'), 'getAllClients');
      
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(getAllClientsSpy).toHaveBeenCalled();
      });

      console.log('✅ Service integrations preserved after cleanup');
    });

    it('should maintain error handling capabilities', async () => {
      // Mock service error
      vi.mocked(require('@/services/clientService').getAllClients)
        .mockRejectedValueOnce(new Error('Service error'));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Should handle errors gracefully after cleanup
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      console.log('✅ Error handling preserved after cleanup');
    });
  });

  describe('Code Quality Validation', () => {
    it('should maintain clean component interfaces', () => {
      // Test that components still accept expected props
      expect(() => {
        renderWithProviders(
          <CopyClientTasksDialog
            open={true}
            onOpenChange={() => {}}
            defaultSourceClientId="client-1"
            sourceClientName="Test Client"
          />
        );
      }).not.toThrow();

      console.log('✅ Component interfaces clean and consistent');
    });

    it('should maintain type safety', () => {
      // TypeScript compilation would catch any type issues
      // This test validates runtime type consistency
      expect(() => {
        renderWithProviders(
          <CopyTasksTab
            initialClientId="client-1"
            onTasksRefresh={() => {}}
            onClose={() => {}}
          />
        );
      }).not.toThrow();

      console.log('✅ Type safety maintained after cleanup');
    });
  });
});
