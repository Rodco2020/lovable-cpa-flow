
/**
 * Regression Tests for Existing Functionality
 * 
 * Ensures that all existing functionality continues to work correctly
 * after the unified type system implementation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';
import ClientDetail from '@/components/clients/ClientDetail';
import { getRecurringTasks, updateRecurringTask, deactivateRecurringTask } from '@/services/taskService';
import { getClientById } from '@/services/clientService';
import { RecurringTask } from '@/types/task';
import { IndustryType, PaymentTerms, BillingFrequency, ClientStatus } from '@/types/client';
import { createMockClient, createMockRecurringTasks } from './fixtures/mockData';
import { setupTestMocks, createTestQueryClient, renderWithProviders } from './helpers/testUtils';
import { runComponentRegressionTests } from './suites/componentRegressionTests';
import { runTypeSystemCompatibilityTests } from './suites/typeSystemTests';
import { runServiceIntegrationTests } from './suites/serviceIntegrationTests';
import { runComponentPropsTests } from './suites/componentPropsTests';
import { runErrorHandlingTests } from './suites/errorHandlingTests';
import { runPerformanceRegressionTests } from './suites/performanceTests';

// Mock services
jest.mock('@/services/taskService');
jest.mock('@/services/clientService');
jest.mock('@/services/skillService');
jest.mock('@/services/staffService');

const mockGetRecurringTasks = getRecurringTasks as jest.MockedFunction<typeof getRecurringTasks>;
const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockDeactivateRecurringTask = deactivateRecurringTask as jest.MockedFunction<typeof deactivateRecurringTask>;
const mockGetClientById = getClientById as jest.MockedFunction<typeof getClientById>;

describe('Existing Functionality Regression Tests', () => {
  let queryClient: QueryClient;
  const mockClient = createMockClient();
  const mockRecurringTasks = createMockRecurringTasks();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    setupTestMocks({
      mockGetClientById,
      mockGetRecurringTasks,
      mockUpdateRecurringTask,
      mockDeactivateRecurringTask,
      mockClient,
      mockRecurringTasks
    });
  });

  // Component functionality regression tests
  runComponentRegressionTests({
    mockClient,
    mockRecurringTasks,
    mockGetRecurringTasks,
    mockUpdateRecurringTask,
    mockDeactivateRecurringTask,
    renderWithProviders: (component: React.ReactElement) => 
      renderWithProviders(component, queryClient)
  });

  // Type system compatibility tests
  runTypeSystemCompatibilityTests({ mockRecurringTasks });

  // Service integration tests
  runServiceIntegrationTests({
    mockGetRecurringTasks,
    mockUpdateRecurringTask,
    mockDeactivateRecurringTask
  });

  // Component props compatibility tests
  runComponentPropsTests({
    renderWithProviders: (component: React.ReactElement) => 
      renderWithProviders(component, queryClient)
  });

  // Error handling compatibility tests
  runErrorHandlingTests({
    mockGetRecurringTasks,
    mockUpdateRecurringTask,
    renderWithProviders: (component: React.ReactElement) => 
      renderWithProviders(component, queryClient)
  });

  // Performance regression tests
  runPerformanceRegressionTests({
    mockGetRecurringTasks,
    mockUpdateRecurringTask,
    renderWithProviders: (component: React.ReactElement) => 
      renderWithProviders(component, queryClient)
  });
});
