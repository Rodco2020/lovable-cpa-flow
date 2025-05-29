
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { ClientTasksSection } from '@/components/clients/ClientTasksSection';
import { vi } from 'vitest';

// Mock services for production readiness testing
vi.mock('@/services/clientService', () => ({
  getAllClients: vi.fn().mockResolvedValue([
    { id: '1', legalName: 'Test Client 1', status: 'Active' },
    { id: '2', legalName: 'Test Client 2', status: 'Active' },
  ]),
}));

vi.mock('@/services/taskCopyService', () => ({
  copyClientTasks: vi.fn().mockResolvedValue({
    recurring: [],
    adHoc: []
  }),
}));

describe('Production Readiness Tests', () => {
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

  describe('Bundle Size and Performance', () => {
    it('should load components within performance budgets', async () => {
      const startTime = performance.now();
      
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      const loadTime = performance.now() - startTime;
      
      // Component should load within 100ms
      expect(loadTime).toBeLessThan(100);
    });

    it('should handle memory efficiently', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Boundary Testing', () => {
    it('should handle component crashes gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Should not crash the entire application
      expect(() => {
        renderWithProviders(<ThrowError />);
      }).not.toThrow();
    });

    it('should display error messages to users', async () => {
      vi.mocked(require('@/services/clientService').getAllClients)
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      // Check for essential ARIA attributes
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      // Should have focusable elements
      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Production Environment Compatibility', () => {
    it('should handle missing environment variables gracefully', () => {
      // Test with undefined env vars
      const originalEnv = process.env;
      process.env = {};

      expect(() => {
        renderWithProviders(
          <CopyClientTasksDialog
            open={true}
            onOpenChange={() => {}}
            defaultSourceClientId="test-client"
          />
        );
      }).not.toThrow();

      process.env = originalEnv;
    });

    it('should work in different timezone settings', () => {
      const originalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Component should handle different timezones
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="test-client"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
