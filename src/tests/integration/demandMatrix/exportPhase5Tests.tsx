
/**
 * Phase 5: Enhanced Export Integration Tests
 * 
 * Tests for the new three-mode filtering export functionality
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrixExportDialog } from '@/components/forecasting/matrix/components/demand/DemandMatrixExportDialog';
import { EnhancedExportService } from '@/services/forecasting/export/enhancedExportService';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

// Mock the enhanced export service
vi.mock('@/services/forecasting/export/enhancedExportService');

const mockDemandData: DemandMatrixData = {
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2025-01',
      monthLabel: 'Jan 2025',
      demandHours: 120,
      taskCount: 8,
      clientCount: 3,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Client 1',
          recurringTaskId: 'task-1',
          taskName: 'Monthly Tax Review',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          recurrencePattern: {
            type: 'monthly',
            interval: 1,
            frequency: 12
          },
          monthlyHours: 60,
          preferredStaff: {
            staffId: 'staff-1',
            staffName: 'John Smith',
            assignmentType: 'preferred'
          }
        },
        {
          clientId: 'client-2',
          clientName: 'Client 2',
          recurringTaskId: 'task-2',
          taskName: 'Quarterly Filing',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          recurrencePattern: {
            type: 'quarterly',
            interval: 3,
            frequency: 4
          },
          monthlyHours: 60,
          preferredStaff: undefined
        }
      ]
    }
  ],
  skills: ['Tax Preparation', 'Audit'],
  months: [
    { key: '2025-01', label: 'Jan 2025' },
    { key: '2025-02', label: 'Feb 2025' }
  ],
  totalDemand: 120,
  totalTasks: 8,
  totalClients: 2,
  skillSummary: {
    'Tax Preparation': {
      totalHours: 120,
      taskCount: 8,
      clientCount: 2
    }
  }
};

const mockFilters: DemandFilters = {
  skills: ['Tax Preparation'],
  clients: ['client-1'],
  preferredStaff: {
    staffIds: ['staff-1'],
    includeUnassigned: false,
    showOnlyPreferred: false
  }
};

export const runExportPhase5IntegrationTests = () => {
  describe('Phase 5: Enhanced Export Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      vi.clearAllMocks();
      
      // Mock successful export
      vi.mocked(EnhancedExportService.exportWithFilteringContext).mockResolvedValue({
        success: true,
        exportedFileName: 'test-export.csv',
        metadata: {
          exportTimestamp: '2025-01-20T10:00:00.000Z',
          filteringMode: {
            preferredStaff: 'specific',
            skills: '1 selected',
            clients: '1 selected',
            timeHorizon: 'all'
          },
          dataIntegrity: {
            validated: true,
            totalDataPoints: 1,
            filteredDataPoints: 1,
            reductionPercentage: 0
          },
          performanceMetrics: {
            filteringTime: 10,
            exportTime: 5,
            totalProcessingTime: 15
          },
          version: 'Phase5-Enhanced'
        }
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should render export dialog with Phase 5 enhancements', async () => {
      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={mockFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={['staff-1']}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation', 'Audit']}
            availableClients={[
              { id: 'client-1', name: 'Client 1' },
              { id: 'client-2', name: 'Client 2' }
            ]}
            availablePreferredStaff={[
              { id: 'staff-1', name: 'John Smith' }
            ]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          >
            <button>Export Data</button>
          </DemandMatrixExportDialog>
        </TestWrapper>
      );

      // Click to open dialog
      await user.click(screen.getByText('Export Data'));

      // Should show Phase 5 enhancements
      expect(screen.getByText('Export Demand Matrix Data (Phase 5 Enhanced)')).toBeInTheDocument();
      expect(screen.getByText('Current Filter Context & Mode Detection')).toBeInTheDocument();
      expect(screen.getByText('Phase 5 Enhanced Options')).toBeInTheDocument();
    });

    it('should detect and display filtering mode correctly', async () => {
      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={mockFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={['staff-1']}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation']}
            availableClients={[{ id: 'client-1', name: 'Client 1' }]}
            availablePreferredStaff={[{ id: 'staff-1', name: 'John Smith' }]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          />
        </TestWrapper>
      );

      await user.click(screen.getByText('Export Matrix Data'));

      // Should detect specific staff mode
      expect(screen.getByText('Specific Staff Mode (1 staff)')).toBeInTheDocument();
    });

    it('should execute enhanced export with comprehensive options', async () => {
      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={mockFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={['staff-1']}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation']}
            availableClients={[{ id: 'client-1', name: 'Client 1' }]}
            availablePreferredStaff={[{ id: 'staff-1', name: 'John Smith' }]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          />
        </TestWrapper>
      );

      await user.click(screen.getByText('Export Matrix Data'));

      // Verify all Phase 5 options are available
      expect(screen.getByLabelText('Include Filtering Metadata')).toBeChecked();
      expect(screen.getByLabelText('Include Task Breakdown')).toBeChecked();
      expect(screen.getByLabelText('Include Preferred Staff Details')).toBeChecked();
      expect(screen.getByLabelText('Include Three-Mode Filter Analysis')).toBeChecked();
      expect(screen.getByLabelText('Validate Data Integrity')).toBeChecked();

      // Execute export
      await user.click(screen.getByText('Export with Phase 5 Enhancements'));

      await waitFor(() => {
        expect(EnhancedExportService.exportWithFilteringContext).toHaveBeenCalledWith(
          mockDemandData,
          mockFilters,
          ['Tax Preparation'],
          ['client-1'],
          { start: 0, end: 1 },
          expect.objectContaining({
            format: 'csv',
            includeMetadata: true,
            includeTaskBreakdown: true,
            includePreferredStaffInfo: true,
            includeFilteringModeDetails: true,
            validateDataIntegrity: true
          })
        );
      });
    });

    it('should handle export errors gracefully', async () => {
      // Mock export failure
      vi.mocked(EnhancedExportService.exportWithFilteringContext).mockResolvedValue({
        success: false,
        errors: ['Data validation failed', 'Export size too large']
      });

      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={mockFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={['staff-1']}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation']}
            availableClients={[{ id: 'client-1', name: 'Client 1' }]}
            availablePreferredStaff={[{ id: 'staff-1', name: 'John Smith' }]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          />
        </TestWrapper>
      );

      await user.click(screen.getByText('Export Matrix Data'));
      await user.click(screen.getByText('Export with Phase 5 Enhancements'));

      await waitFor(() => {
        expect(screen.getByText(/Export failed:/)).toBeInTheDocument();
        expect(screen.getByText(/Data validation failed, Export size too large/)).toBeInTheDocument();
      });
    });

    it('should support different export formats', async () => {
      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={mockFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={['staff-1']}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation']}
            availableClients={[{ id: 'client-1', name: 'Client 1' }]}
            availablePreferredStaff={[{ id: 'staff-1', name: 'John Smith' }]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          />
        </TestWrapper>
      );

      await user.click(screen.getByText('Export Matrix Data'));

      // Test JSON format selection
      await user.click(screen.getByLabelText('JSON'));
      await user.click(screen.getByText('Export with Phase 5 Enhancements'));

      await waitFor(() => {
        expect(EnhancedExportService.exportWithFilteringContext).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            format: 'json'
          })
        );
      });
    });

    it('should detect unassigned-only filtering mode', async () => {
      const unassignedOnlyFilters: DemandFilters = {
        preferredStaff: {
          staffIds: [],
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      };

      render(
        <TestWrapper>
          <DemandMatrixExportDialog
            demandData={mockDemandData}
            currentFilters={unassignedOnlyFilters}
            groupingMode="skill"
            selectedSkills={['Tax Preparation']}
            selectedClients={['client-1']}
            selectedPreferredStaff={[]}
            monthRange={{ start: 0, end: 1 }}
            availableSkills={['Tax Preparation']}
            availableClients={[{ id: 'client-1', name: 'Client 1' }]}
            availablePreferredStaff={[{ id: 'staff-1', name: 'John Smith' }]}
            isAllSkillsSelected={false}
            isAllClientsSelected={false}
            isAllPreferredStaffSelected={false}
          />
        </TestWrapper>
      );

      await user.click(screen.getByText('Export Matrix Data'));

      // Should detect unassigned only mode
      expect(screen.getByText('Unassigned Only Mode')).toBeInTheDocument();
    });
  });
};
