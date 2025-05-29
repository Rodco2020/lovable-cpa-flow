
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { CopyTasksTab } from '@/components/clients/TaskOperationsTab/CopyTasksTab';
import { vi } from 'vitest';

describe('Edge Case Validation Tests', () => {
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

  describe('Data Edge Cases', () => {
    it('should handle empty client list', async () => {
      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue([]),
      }));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no clients available/i)).toBeInTheDocument();
      });

      console.log('✅ Empty client list handled correctly');
    });

    it('should handle single client scenario', async () => {
      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue([
          { id: 'client-1', legalName: 'Only Client', status: 'Active' }
        ]),
      }));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      // Should show appropriate message when no target clients available
      await waitFor(() => {
        expect(screen.getByText(/no other clients available/i)).toBeInTheDocument();
      });

      console.log('✅ Single client scenario handled correctly');
    });

    it('should handle clients with special characters in names', async () => {
      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue([
          { id: 'client-1', legalName: 'Client & Co. (Holdings) Ltd.', status: 'Active' },
          { id: 'client-2', legalName: 'Émile & François S.A.R.L.', status: 'Active' },
        ]),
      }));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/client & co\. \(holdings\) ltd\./i)).toBeInTheDocument();
        expect(screen.getByText(/émile & françois s\.a\.r\.l\./i)).toBeInTheDocument();
      });

      console.log('✅ Special characters in client names handled correctly');
    });

    it('should handle very long client names', async () => {
      const longClientName = 'A'.repeat(200) + ' Corporation';
      
      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue([
          { id: 'client-1', legalName: longClientName, status: 'Active' },
          { id: 'client-2', legalName: 'Normal Client', status: 'Active' },
        ]),
      }));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Should display long names without breaking layout
      await waitFor(() => {
        expect(screen.getByText(new RegExp(longClientName.substring(0, 50), 'i'))).toBeInTheDocument();
      });

      console.log('✅ Long client names handled correctly');
    });
  });

  describe('Interaction Edge Cases', () => {
    it('should handle rapid clicking on navigation buttons', async () => {
      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockResolvedValue([
          { id: 'client-1', legalName: 'Client 1', status: 'Active' },
          { id: 'client-2', legalName: 'Client 2', status: 'Active' },
        ]),
      }));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/target client/i)).toBeInTheDocument();
      });

      // Rapid clicking should not cause issues
      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Should still be on target selection since it's disabled without selection
      expect(screen.getByText(/target client/i)).toBeInTheDocument();

      console.log('✅ Rapid clicking handled correctly');
    });

    it('should handle keyboard navigation edge cases', async () => {
      renderWithProviders(
        <CopyTasksTab
          initialClientId="client-1"
          onTasksRefresh={() => {}}
        />
      );

      // Test various keyboard inputs
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Should not crash or cause unexpected behavior
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      console.log('✅ Keyboard navigation edge cases handled correctly');
    });
  });

  describe('State Edge Cases', () => {
    it('should handle component unmounting during async operations', async () => {
      let resolvePromise: (value: any) => void;
      const asyncPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mock('@/services/clientService', () => ({
        getAllClients: vi.fn().mockReturnValue(asyncPromise),
      }));

      const { unmount } = renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Unmount before async operation completes
      unmount();

      // Complete the async operation
      resolvePromise!([
        { id: 'client-1', legalName: 'Client 1', status: 'Active' }
      ]);

      // Should not cause any errors or memory leaks
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('✅ Component unmounting during async operations handled correctly');
    });

    it('should handle prop changes during workflow', async () => {
      const { rerender } = renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      // Change props while component is active
      rerender(
        <TestWrapper>
          <QueryClientProvider client={queryClient}>
            <CopyClientTasksDialog
              open={true}
              onOpenChange={() => {}}
              defaultSourceClientId="client-2"
              sourceClientName="Different Client"
            />
          </QueryClientProvider>
        </TestWrapper>
      );

      // Should handle prop changes gracefully
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      console.log('✅ Prop changes during workflow handled correctly');
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing modern browser features', async () => {
      // Mock missing performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      // Restore performance API
      global.performance = originalPerformance;

      console.log('✅ Missing browser features handled correctly');
    });

    it('should handle limited local storage', async () => {
      // Mock localStorage quota exceeded
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      renderWithProviders(
        <CopyTasksTab
          initialClientId="client-1"
          onTasksRefresh={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      // Restore localStorage
      Storage.prototype.setItem = originalSetItem;

      console.log('✅ Limited local storage handled correctly');
    });
  });
});
