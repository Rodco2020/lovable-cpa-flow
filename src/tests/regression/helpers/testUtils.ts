
/**
 * Test Utilities for Regression Tests
 * 
 * Shared utility functions for setting up tests, mocks, and rendering components
 * with proper providers across all regression test suites.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

export const renderWithProviders = (component: React.ReactElement, queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export interface MockSetupConfig {
  mockGetClientById: jest.MockedFunction<any>;
  mockGetRecurringTasks: jest.MockedFunction<any>;
  mockUpdateRecurringTask: jest.MockedFunction<any>;
  mockDeactivateRecurringTask: jest.MockedFunction<any>;
  mockClient: any;
  mockRecurringTasks: any[];
}

export const setupTestMocks = ({
  mockGetClientById,
  mockGetRecurringTasks,
  mockUpdateRecurringTask,
  mockDeactivateRecurringTask,
  mockClient,
  mockRecurringTasks
}: MockSetupConfig) => {
  // Setup default mocks with correct return types
  mockGetClientById.mockResolvedValue(mockClient);
  mockGetRecurringTasks.mockResolvedValue(mockRecurringTasks);
  mockUpdateRecurringTask.mockResolvedValue(undefined);
  mockDeactivateRecurringTask.mockResolvedValue(undefined);

  jest.clearAllMocks();
};
