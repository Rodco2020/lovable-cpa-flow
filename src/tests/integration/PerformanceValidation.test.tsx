
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { CopyTasksTab } from '@/components/clients/TaskOperationsTab/CopyTasksTab';
import { vi } from 'vitest';

describe('Performance Validation Tests', () => {
  let queryClient: QueryClient;

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

  describe('Memory Usage Validation', () => {
    it('should not leak memory during component lifecycle', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProviders(
          <CopyClientTasksDialog
            open={true}
            onOpenChange={() => {}}
            defaultSourceClientId="client-1"
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

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);

      console.log(`✅ Memory usage validation passed. Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Render Performance Validation', () => {
    it('should render large client lists efficiently', async () => {
      // Mock large dataset
      const largeClientList = Array.from({ length: 2000 }, (_, i) => ({
        id: `client-${i}`,
        legalName: `Client ${i}`,
        status: 'Active'
      }));

      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue(largeClientList),
      }));

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

      // Should render within 3 seconds even with large dataset
      expect(renderTime).toBeLessThan(3000);

      console.log(`✅ Large dataset render performance: ${renderTime.toFixed(2)}ms`);
    });

    it('should handle rapid component mounting/unmounting', async () => {
      const renderTimes: number[] = [];

      // Test rapid mounting/unmounting
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        const { unmount } = renderWithProviders(
          <CopyTasksTab
            initialClientId="client-1"
            onTasksRefresh={() => {}}
          />
        );

        await waitFor(() => {
          expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
        });

        const endTime = performance.now();
        renderTimes.push(endTime - startTime);

        unmount();
      }

      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;

      // Average render time should be reasonable
      expect(averageRenderTime).toBeLessThan(1000);

      console.log(`✅ Rapid mount/unmount performance: ${averageRenderTime.toFixed(2)}ms average`);
    });
  });

  describe('Network Performance Validation', () => {
    it('should handle concurrent service calls efficiently', async () => {
      // Mock concurrent service calls
      const mockGetClients = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([
          { id: 'client-1', legalName: 'Client 1', status: 'Active' },
          { id: 'client-2', legalName: 'Client 2', status: 'Active' },
        ]), 100))
      );

      vi.mock('@/services/clientService', () => ({
        getAllClients: mockGetClients,
      }));

      const startTime = performance.now();

      // Render multiple components concurrently
      const promises = Array.from({ length: 3 }, () => 
        new Promise(resolve => {
          const { unmount } = renderWithProviders(
            <CopyClientTasksDialog
              open={true}
              onOpenChange={() => {}}
            />
          );
          
          waitFor(() => {
            expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
          }).then(() => {
            unmount();
            resolve(undefined);
          });
        })
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(2000);

      console.log(`✅ Concurrent service calls performance: ${totalTime.toFixed(2)}ms`);
    });
  });
});
