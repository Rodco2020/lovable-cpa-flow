
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { vi } from 'vitest';

// Mock large dataset for performance testing
const generateMockClients = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `client-${i}`,
    legalName: `Test Client ${i}`,
    status: i % 3 === 0 ? 'Active' : 'Inactive',
    industry: `Industry ${i % 10}`,
    expectedMonthlyRevenue: 1000 + (i * 100),
    primaryContact: `contact${i}@test.com`
  }));
};

const generateMockTasks = (count: number, clientId: string) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    name: `Task ${i}`,
    clientId,
    estimatedHours: 1 + (i % 10),
    priority: i % 3 === 0 ? 'High' : 'Medium',
    status: 'Active',
    taskType: i % 2 === 0 ? 'recurring' : 'ad-hoc'
  }));
};

// Mock services with large datasets
vi.mock('@/services/clientService', () => ({
  getAllClients: vi.fn().mockResolvedValue(generateMockClients(1000)),
}));

vi.mock('@/services/taskService', () => ({
  getClientTasks: vi.fn().mockImplementation((clientId) => 
    Promise.resolve(generateMockTasks(500, clientId))
  ),
}));

vi.mock('@/services/taskCopyService', () => ({
  copyClientTasks: vi.fn().mockResolvedValue({
    recurring: generateMockTasks(250, 'target-client'),
    adHoc: generateMockTasks(250, 'target-client')
  }),
}));

describe('Copy Workflow Performance Tests', () => {
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

  it('should handle large client lists efficiently', async () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-client"
      />
    );

    // Wait for client list to load
    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const renderTime = performance.now() - startTime;
    
    // Ensure rendering 1000 clients doesn't exceed 2 seconds
    expect(renderTime).toBeLessThan(2000);
    
    // Verify virtualization is working (not all clients rendered at once)
    const clientElements = screen.getAllByText(/Test Client/);
    expect(clientElements.length).toBeLessThan(50); // Should be virtualized
  });

  it('should handle large task selection efficiently', async () => {
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-client"
      />
    );

    // Navigate to task selection
    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });

    const targetClient = await screen.findByText('Test Client 1');
    await user.click(targetClient);

    // Measure task loading performance
    const startTime = performance.now();
    
    await waitFor(() => {
      expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const loadTime = performance.now() - startTime;
    
    // Task loading should be under 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  it('should handle bulk operations without memory leaks', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-client"
      />
    );

    // Complete full workflow multiple times
    for (let i = 0; i < 5; i++) {
      // Reset dialog
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      
      // Complete workflow
      await waitFor(() => {
        expect(screen.getByText(/select target client/i)).toBeInTheDocument();
      });

      const targetClient = await screen.findByText('Test Client 1');
      await user.click(targetClient);

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // Select some tasks
      const selectAllButton = screen.getByText(/select all/i);
      await user.click(selectAllButton);
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('should maintain responsive UI during processing', async () => {
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-client"
      />
    );

    // Complete workflow to processing step
    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });

    const targetClient = await screen.findByText('Test Client 1');
    await user.click(targetClient);

    await waitFor(() => {
      expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
    });

    // Start copy operation
    const copyButton = screen.getByText(/copy tasks/i);
    const startTime = performance.now();
    
    await user.click(copyButton);

    // Verify UI remains responsive during processing
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    const responseTime = performance.now() - startTime;
    
    // UI should respond quickly even with large operations
    expect(responseTime).toBeLessThan(500);
  });

  it('should efficiently filter and search large datasets', async () => {
    renderWithProviders(
      <CopyClientTasksDialog
        open={true}
        onOpenChange={() => {}}
        defaultSourceClientId="source-client"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Measure search performance
    const startTime = performance.now();
    
    await user.type(searchInput, 'Test Client 1');
    
    // Wait for search results
    await waitFor(() => {
      const results = screen.getAllByText(/Test Client 1/);
      expect(results.length).toBeGreaterThan(0);
    });

    const searchTime = performance.now() - startTime;
    
    // Search should be fast even with 1000 clients
    expect(searchTime).toBeLessThan(200);
  });
});
