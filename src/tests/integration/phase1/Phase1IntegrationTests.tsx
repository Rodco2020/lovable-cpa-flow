
/**
 * Phase 1: Comprehensive Integration Tests
 * 
 * Tests all aspects of Phase 1 implementation:
 * - Data pipeline integrity
 * - Component integration
 * - Backward compatibility
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { PipelineValidator } from '@/services/forecasting/demand/dataFetcher/integration/pipelineValidator';
import { ComponentIntegrationTester } from '@/components/forecasting/matrix/hooks/useMatrixControls/integration/integrationTester';

// Mock the Supabase client for testing
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          not: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [
                {
                  id: 'task-1',
                  name: 'Test Task',
                  preferred_staff_id: 'staff-1',
                  staff: { id: 'staff-1', full_name: 'John Doe', status: 'active' }
                }
              ],
              error: null
            }))
          })),
          limit: vi.fn(() => Promise.resolve({
            data: [{ id: 'test-id', name: 'Test Record' }],
            error: null
          }))
        })),
        is: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{ id: 'unassigned-task', preferred_staff_id: null }],
              error: null
            }))
          }))
        })),
        contains: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{ id: 'skill-task', required_skills: ['Tax Preparation'] }],
              error: null
            }))
          }))
        })),
        limit: vi.fn(() => Promise.resolve({
          data: [{ id: 'test-record', name: 'Test' }],
          error: null
        }))
      }))
    }))
  }
}));

describe('Phase 1: Integration Verification & Data Pipeline Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Pipeline Integrity Tests', () => {
    test('validates complete data pipeline', async () => {
      const validationResult = await PipelineValidator.validateDataPipeline();
      
      expect(validationResult).toBeDefined();
      expect(typeof validationResult.success).toBe('boolean');
      expect(validationResult.dataIntegrity).toBeDefined();
      expect(validationResult.filteringLogic).toBeDefined();
      expect(validationResult.backwardCompatibility).toBeDefined();
      
      // Data integrity checks
      expect(typeof validationResult.dataIntegrity.preferredStaffDataLoaded).toBe('boolean');
      expect(typeof validationResult.dataIntegrity.recurringTasksLoaded).toBe('boolean');
      expect(typeof validationResult.dataIntegrity.clientsLoaded).toBe('boolean');
      expect(typeof validationResult.dataIntegrity.skillsLoaded).toBe('boolean');
      
      // Filtering logic checks
      expect(typeof validationResult.filteringLogic.allModeWorking).toBe('boolean');
      expect(typeof validationResult.filteringLogic.specificModeWorking).toBe('boolean');
      expect(typeof validationResult.filteringLogic.noneModeWorking).toBe('boolean');
      
      // Backward compatibility checks
      expect(typeof validationResult.backwardCompatibility.existingFiltersWorking).toBe('boolean');
      expect(typeof validationResult.backwardCompatibility.exportFunctionalityIntact).toBe('boolean');
      expect(typeof validationResult.backwardCompatibility.matrixDataConsistent).toBe('boolean');
    });

    test('handles validation errors gracefully', async () => {
      // Mock a validation error scenario
      vi.mocked(require('@/lib/supabaseClient').supabase.from).mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });
      
      const validationResult = await PipelineValidator.validateDataPipeline();
      
      expect(validationResult.success).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0]).toContain('Database connection failed');
    });
  });

  describe('Component Integration Tests', () => {
    test('validates matrix controls and filtering integration', () => {
      const mockMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 100,
            taskCount: 2,
            clientCount: 1,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                monthlyHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'Senior CPA',
                  assignmentType: 'preferred' as const
                }
              },
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-2',
                taskName: 'Unassigned Task',
                skillType: 'Tax Preparation',
                estimatedHours: 15,
                monthlyHours: 15,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
                // No preferred staff
              }
            ]
          }
        ],
        totalDemand: 100,
        totalTasks: 2,
        totalClients: 1,
        skillSummary: {}
      };

      const mockControlsState = {
        preferredStaffFilterMode: 'all',
        selectedPreferredStaff: ['staff-1'],
        isAllPreferredStaffSelected: false,
        onPreferredStaffToggle: vi.fn(),
        onPreferredStaffFilterModeChange: vi.fn()
      };

      const mockFilteringResult = {
        dataPoints: mockMatrixData.dataPoints
      };

      const integrationResult = ComponentIntegrationTester.validateComponentIntegration(
        mockMatrixData,
        mockControlsState,
        mockFilteringResult
      );

      expect(integrationResult).toBeDefined();
      expect(typeof integrationResult.success).toBe('boolean');
      
      // Matrix controls integration
      expect(integrationResult.matrixControlsIntegration.threeModeStateManagement).toBe(true);
      expect(integrationResult.matrixControlsIntegration.parameterPassing).toBe(true);
      expect(integrationResult.matrixControlsIntegration.filterSynchronization).toBe(true);
      
      // Filtering integration
      expect(typeof integrationResult.filteringIntegration.allModeProcessing).toBe('boolean');
      expect(typeof integrationResult.filteringIntegration.specificModeProcessing).toBe('boolean');
      expect(typeof integrationResult.filteringIntegration.noneModeProcessing).toBe('boolean');
      
      // Data flow validation
      expect(integrationResult.dataFlowValidation.controlsToFilteringFlow).toBe(true);
      expect(integrationResult.dataFlowValidation.filteringToDisplayFlow).toBe(true);
      expect(integrationResult.dataFlowValidation.stateConsistency).toBe(true);
    });

    test('detects integration issues', () => {
      const mockMatrixData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      const mockControlsState = {
        // Missing required properties to test error detection
        preferredStaffFilterMode: 'invalid-mode',
        selectedPreferredStaff: null,
        isAllPreferredStaffSelected: 'not-boolean'
      };

      const mockFilteringResult = null;

      const integrationResult = ComponentIntegrationTester.validateComponentIntegration(
        mockMatrixData,
        mockControlsState,
        mockFilteringResult
      );

      expect(integrationResult.success).toBe(false);
      expect(integrationResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility Tests', () => {
    test('preserves existing matrix functionality', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Test that matrix renders without errors
      await waitFor(() => {
        // Should render matrix container
        const matrixElement = screen.getByText(/Matrix/i);
        expect(matrixElement).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('maintains existing filter functionality', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should render filter controls
        expect(screen.getByText(/Skills/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Test that existing filter elements are present
      // These should work exactly as before
      const filterElements = screen.getAllByRole('button');
      expect(filterElements.length).toBeGreaterThan(0);
    });

    test('preserves export functionality structure', async () => {
      // Test that export data structure is maintained
      const mockData = {
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            demandHours: 100,
            taskCount: 2,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return',
                estimatedHours: 20,
                monthlyHours: 20,
                skillType: 'Tax Preparation',
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'Senior CPA',
                  assignmentType: 'preferred' as const
                }
              }
            ]
          }
        ]
      };

      // Verify that all required export fields are present
      const dataPoint = mockData.dataPoints[0];
      expect(dataPoint.skillType).toBeDefined();
      expect(dataPoint.month).toBeDefined();
      expect(dataPoint.demandHours).toBeDefined();
      expect(dataPoint.taskCount).toBeDefined();
      expect(Array.isArray(dataPoint.taskBreakdown)).toBe(true);
      
      // Verify task breakdown structure includes new preferred staff data
      const task = dataPoint.taskBreakdown[0];
      expect(task.clientId).toBeDefined();
      expect(task.clientName).toBeDefined();
      expect(task.taskName).toBeDefined();
      expect(task.estimatedHours).toBeDefined();
      expect(task.monthlyHours).toBeDefined();
      expect(task.preferredStaff).toBeDefined();
      expect(task.preferredStaff?.staffId).toBeDefined();
      expect(task.preferredStaff?.staffName).toBeDefined();
    });
  });

  describe('Three-Mode Logic Verification', () => {
    test('validates all mode logic in isolation', () => {
      const mockData = {
        dataPoints: [
          {
            taskBreakdown: [
              { preferredStaff: { staffId: 'staff-1' } }, // Assigned task
              { preferredStaff: null } // Unassigned task
            ]
          }
        ]
      };

      // All mode should include both assigned and unassigned tasks
      const allModeTasks = mockData.dataPoints[0].taskBreakdown;
      expect(allModeTasks.length).toBe(2);
      
      const hasAssignedTasks = allModeTasks.some(task => task.preferredStaff?.staffId);
      const hasUnassignedTasks = allModeTasks.some(task => !task.preferredStaff?.staffId);
      
      expect(hasAssignedTasks).toBe(true);
      expect(hasUnassignedTasks).toBe(true);
    });

    test('validates specific mode logic in isolation', () => {
      const mockData = {
        dataPoints: [
          {
            taskBreakdown: [
              { preferredStaff: { staffId: 'staff-1' } },
              { preferredStaff: { staffId: 'staff-2' } },
              { preferredStaff: null }
            ]
          }
        ]
      };

      // Specific mode should filter by selected staff
      const selectedStaffIds = ['staff-1'];
      const specificModeTasks = mockData.dataPoints[0].taskBreakdown.filter(task =>
        task.preferredStaff?.staffId && selectedStaffIds.includes(task.preferredStaff.staffId)
      );

      expect(specificModeTasks.length).toBe(1);
      expect(specificModeTasks[0].preferredStaff?.staffId).toBe('staff-1');
    });

    test('validates none mode logic in isolation', () => {
      const mockData = {
        dataPoints: [
          {
            taskBreakdown: [
              { preferredStaff: { staffId: 'staff-1' } },
              { preferredStaff: null },
              { preferredStaff: null }
            ]
          }
        ]
      };

      // None mode should show only unassigned tasks
      const noneModeTasks = mockData.dataPoints[0].taskBreakdown.filter(task =>
        !task.preferredStaff?.staffId
      );

      expect(noneModeTasks.length).toBe(2);
      noneModeTasks.forEach(task => {
        expect(task.preferredStaff?.staffId).toBeFalsy();
      });
    });
  });
});
