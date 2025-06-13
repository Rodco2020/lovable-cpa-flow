import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillCalculatorCore } from '@/services/forecasting/demand/skillCalculator/skillCalculatorCore';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator';
import { DemandMatrixGrid } from '@/components/forecasting/matrix/components/demand/DemandMatrixGrid';
import { RecurringTaskDB } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

/**
 * Phase 4: Matrix Calculations Integration Tests
 * 
 * This test suite verifies that the enhanced recurrence calculations
 * integrate properly with the matrix visualization system.
 * 
 * Testing Focus:
 * - SkillCalculatorCore integration with matrix display
 * - Weekly recurring task calculations in matrix cells
 * - Multi-client and multi-skill consistency
 * - Performance monitoring for large datasets
 * - Compatibility with filtering and export features
 */

describe('Phase 4: Matrix Calculations Integration', () => {
  // Mock test data representing various recurrence patterns
  const mockWeeklyTasks: RecurringTaskDB[] = [
    {
      id: 'weekly-1',
      name: 'Weekly Tax Review',
      template_id: 'template-weekly-1',
      client_id: 'client-a',
      estimated_hours: 8,
      required_skills: ['Tax Preparation'],
      recurrence_type: 'Weekly',
      recurrence_interval: 1,
      weekdays: [1, 3, 5], // Mon, Wed, Fri
      is_active: true,
      priority: 'High',
      category: 'Tax',
      status: 'Unscheduled',
      due_date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      description: 'Weekly tax review task',
      notes: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null
    },
    {
      id: 'weekly-2',
      name: 'Bi-Weekly Bookkeeping',
      template_id: 'template-weekly-2',
      client_id: 'client-b',
      estimated_hours: 12,
      required_skills: ['Bookkeeping'],
      recurrence_type: 'Weekly',
      recurrence_interval: 2,
      weekdays: [2, 4], // Tue, Thu every 2 weeks
      is_active: true,
      priority: 'Medium',
      category: 'Bookkeeping',
      status: 'Unscheduled',
      due_date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      description: 'Bi-weekly bookkeeping task',
      notes: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null
    }
  ];

  const mockMonthlyTasks: RecurringTaskDB[] = [
    {
      id: 'monthly-1',
      name: 'Monthly Report',
      template_id: 'template-monthly-1',
      client_id: 'client-a',
      estimated_hours: 16,
      required_skills: ['Financial Analysis'],
      recurrence_type: 'Monthly',
      recurrence_interval: 1,
      weekdays: null,
      is_active: true,
      priority: 'High',
      category: 'Reporting',
      status: 'Unscheduled',
      due_date: '2025-01-30T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      description: 'Monthly financial report',
      notes: null,
      day_of_month: 30,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null
    }
  ];

  let performanceMetrics: {
    calculationTime: number;
    matrixRenderTime: number;
    totalTasks: number;
  };

  beforeEach(() => {
    performanceMetrics = {
      calculationTime: 0,
      matrixRenderTime: 0,
      totalTasks: 0
    };
    
    // Clear any existing mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Log performance metrics for monitoring
    console.log('📊 [INTEGRATION TEST] Performance Metrics:', performanceMetrics);
  });

  describe('SkillCalculatorCore Integration', () => {
    it('should integrate properly with matrix calculation pipeline', async () => {
      const startTime = performance.now();
      
      const monthStart = new Date('2025-01-01');
      const monthEnd = new Date('2025-01-31');
      
      // Test with combined task set
      const allTasks = [...mockWeeklyTasks, ...mockMonthlyTasks];
      performanceMetrics.totalTasks = allTasks.length;
      
      const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
        allTasks,
        monthStart,
        monthEnd
      );
      
      performanceMetrics.calculationTime = performance.now() - startTime;
      
      // Verify integration results
      expect(skillHours).toBeDefined();
      expect(Array.isArray(skillHours)).toBe(true);
      expect(skillHours.length).toBeGreaterThan(0);
      
      // Verify weekly tasks are calculated correctly
      const taxPreparationSkill = skillHours.find(sh => sh.skill === 'Tax Preparation');
      expect(taxPreparationSkill).toBeDefined();
      expect(taxPreparationSkill?.hours).toBeGreaterThan(0);
      
      // Verify monthly tasks are still working
      const financialAnalysisSkill = skillHours.find(sh => sh.skill === 'Financial Analysis');
      expect(financialAnalysisSkill).toBeDefined();
      expect(financialAnalysisSkill?.hours).toBe(16); // Monthly task should be 16 hours
      
      console.log('✅ [INTEGRATION] SkillCalculatorCore integration verified:', {
        totalSkills: skillHours.length,
        calculationTime: performanceMetrics.calculationTime,
        weeklyTasksFound: !!taxPreparationSkill,
        monthlyTasksFound: !!financialAnalysisSkill
      });
    });

    it('should handle weekly recurring tasks with specific weekdays', async () => {
      const monthStart = new Date('2025-01-01');
      const monthEnd = new Date('2025-01-31');
      
      // Test only weekly tasks with weekdays
      const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
        mockWeeklyTasks,
        monthStart,
        monthEnd
      );
      
      // Verify weekday calculations
      const taxPreparationSkill = skillHours.find(sh => sh.skill === 'Tax Preparation');
      const bookkeepingSkill = skillHours.find(sh => sh.skill === 'Bookkeeping');
      
      expect(taxPreparationSkill).toBeDefined();
      expect(bookkeepingSkill).toBeDefined();
      
      // Manual calculation verification:
      // Tax task: 8 hours × 3 days/week × ~4.35 weeks/month = ~104.4 hours
      // Bookkeeping: 12 hours × 2 days/week × ~4.35 weeks/month ÷ 2 interval = ~52.2 hours
      expect(taxPreparationSkill?.hours).toBeGreaterThan(90);
      expect(taxPreparationSkill?.hours).toBeLessThan(120);
      expect(bookkeepingSkill?.hours).toBeGreaterThan(45);
      expect(bookkeepingSkill?.hours).toBeLessThan(65);
      
      console.log('✅ [INTEGRATION] Weekly weekday calculations verified:', {
        taxHours: taxPreparationSkill?.hours,
        bookkeepingHours: bookkeepingSkill?.hours
      });
    });
  });

  describe('Matrix UI Display Integration', () => {
    it('should display correct totals in matrix cells for weekly tasks', async () => {
      const renderStart = performance.now();
      
      // Create mock matrix data that would result from our calculations
      const mockMatrixData: DemandMatrixData = {
        months: [
          { key: '2025-01', label: 'Jan 2025' },
          { key: '2025-02', label: 'Feb 2025' }
        ],
        skills: ['Tax Preparation', 'Bookkeeping', 'Financial Analysis'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 104.4, // Expected weekly calculation result
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientId: 'client-a',
              clientName: 'Client A',
              recurringTaskId: 'weekly-1',
              taskName: 'Weekly Tax Review',
              skillType: 'Tax Preparation',
              estimatedHours: 8,
              recurrencePattern: { type: 'Weekly', interval: 1, frequency: 3 },
              monthlyHours: 104.4
            }]
          },
          {
            skillType: 'Bookkeeping',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 52.2, // Expected bi-weekly calculation result
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientId: 'client-b',
              clientName: 'Client B',
              recurringTaskId: 'weekly-2',
              taskName: 'Bi-Weekly Bookkeeping',
              skillType: 'Bookkeeping',
              estimatedHours: 12,
              recurrencePattern: { type: 'Weekly', interval: 2, frequency: 2 },
              monthlyHours: 52.2
            }]
          }
        ],
        totalDemand: 156.6,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {
          'Tax Preparation': { totalHours: 104.4, taskCount: 1, clientCount: 1 },
          'Bookkeeping': { totalHours: 52.2, taskCount: 1, clientCount: 1 }
        }
      };
      
      render(
        <DemandMatrixGrid
          filteredData={mockMatrixData}
          groupingMode="skill"
        />
      );
      
      performanceMetrics.matrixRenderTime = performance.now() - renderStart;
      
      await waitFor(() => {
        // Verify Tax Preparation cell displays correct hours
        expect(screen.getByText(/104\.4h/)).toBeInTheDocument();
        
        // Verify Bookkeeping cell displays correct hours
        expect(screen.getByText(/52\.2h/)).toBeInTheDocument();
        
        // Verify task counts
        expect(screen.getByText('1 task')).toBeInTheDocument();
      });
      
      console.log('✅ [INTEGRATION] Matrix UI display verified:', {
        renderTime: performanceMetrics.matrixRenderTime,
        cellsRendered: document.querySelectorAll('[class*="border"]').length
      });
    });

    it('should maintain consistency across multiple clients and skills', async () => {
      // Create comprehensive test data
      const multiClientData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation', 'Bookkeeping', 'Financial Analysis'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 120.5,
            taskCount: 2,
            clientCount: 2,
            taskBreakdown: [
              {
                clientId: 'client-a',
                clientName: 'Client A',
                recurringTaskId: 'weekly-1a',
                taskName: 'Weekly Tax Review A',
                skillType: 'Tax Preparation',
                estimatedHours: 8,
                recurrencePattern: { type: 'Weekly', interval: 1, frequency: 3 },
                monthlyHours: 104.4
              },
              {
                clientId: 'client-b',
                clientName: 'Client B',
                recurringTaskId: 'weekly-1b',
                taskName: 'Weekly Tax Review B',
                skillType: 'Tax Preparation',
                estimatedHours: 4,
                recurrencePattern: { type: 'Weekly', interval: 1, frequency: 1 },
                monthlyHours: 16.1
              }
            ]
          }
        ],
        totalDemand: 120.5,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {
          'Tax Preparation': { totalHours: 120.5, taskCount: 2, clientCount: 2 }
        }
      };
      
      render(
        <DemandMatrixGrid
          filteredData={multiClientData}
          groupingMode="skill"
        />
      );
      
      await waitFor(() => {
        // Verify aggregated hours across multiple clients
        expect(screen.getByText(/120\.5h/)).toBeInTheDocument();
        
        // Verify multiple tasks and clients are counted
        expect(screen.getByText('2 tasks')).toBeInTheDocument();
        expect(screen.getByText('2 clients')).toBeInTheDocument();
      });
      
      console.log('✅ [INTEGRATION] Multi-client consistency verified');
    });
  });

  describe('Performance Monitoring', () => {
    it('should maintain efficient calculations with large datasets', async () => {
      // Create a large dataset for performance testing
      const largeTasks: RecurringTaskDB[] = [];
      for (let i = 0; i < 100; i++) {
        largeTasks.push({
          id: `perf-task-${i}`,
          name: `Performance Task ${i}`,
          template_id: `template-${i}`,
          client_id: `client-${i % 10}`, // 10 different clients
          estimated_hours: Math.floor(Math.random() * 20) + 1,
          required_skills: [`Skill ${i % 5}`], // 5 different skills
          recurrence_type: i % 3 === 0 ? 'Weekly' : i % 3 === 1 ? 'Monthly' : 'Quarterly',
          recurrence_interval: Math.floor(Math.random() * 3) + 1,
          weekdays: i % 3 === 0 ? [1, 3, 5] : null,
          is_active: true,
          priority: 'Medium',
          category: 'Test',
          status: 'Unscheduled',
          due_date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          description: `Performance test task ${i}`,
          notes: null,
          day_of_month: null,
          month_of_year: null,
          end_date: null,
          custom_offset_days: null,
          last_generated_date: null
        });
      }
      
      const startTime = performance.now();
      
      const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
        largeTasks,
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      
      const calculationTime = performance.now() - startTime;
      
      // Performance assertions
      expect(calculationTime).toBeLessThan(1000); // Should complete within 1 second
      expect(skillHours.length).toBeGreaterThan(0);
      expect(skillHours.length).toBeLessThanOrEqual(5); // 5 different skills
      
      console.log('✅ [INTEGRATION] Performance test passed:', {
        tasksProcessed: largeTasks.length,
        calculationTime: calculationTime,
        skillsReturned: skillHours.length,
        performanceRating: calculationTime < 500 ? 'Excellent' : calculationTime < 1000 ? 'Good' : 'Needs optimization'
      });
    });

    it('should monitor memory usage during matrix calculations', () => {
      // Basic memory usage check
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Simulate matrix data processing
      const largeMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${String(i + 1).padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: Array.from({ length: 20 }, (_, i) => `Skill ${i + 1}`),
        dataPoints: [] as any[]
      };
      
      // Create data points for all combinations
      for (const month of largeMatrixData.months) {
        for (const skill of largeMatrixData.skills) {
          largeMatrixData.dataPoints.push({
            skillType: skill,
            month: month.key,
            monthLabel: month.label,
            demandHours: Math.random() * 100,
            taskCount: Math.floor(Math.random() * 10),
            clientCount: Math.floor(Math.random() * 5),
            taskBreakdown: []
          });
        }
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryUsed = finalMemory - initialMemory;
      
      console.log('📊 [INTEGRATION] Memory usage monitoring:', {
        initialMemory: Math.round(initialMemory / 1024 / 1024),
        finalMemory: Math.round(finalMemory / 1024 / 1024),
        memoryUsed: Math.round(memoryUsed / 1024 / 1024),
        dataPointsCreated: largeMatrixData.dataPoints.length
      });
      
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Compatibility Testing', () => {
    it('should maintain compatibility with filtering features', async () => {
      const mockData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation', 'Bookkeeping'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 104.4,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: []
          },
          {
            skillType: 'Bookkeeping',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 52.2,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: []
          }
        ],
        totalDemand: 156.6,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {
          'Tax Preparation': { totalHours: 104.4, taskCount: 1, clientCount: 1 },
          'Bookkeeping': { totalHours: 52.2, taskCount: 1, clientCount: 1 }
        }
      };
      
      // Test filtering by skill
      const filteredData = {
        ...mockData,
        skills: ['Tax Preparation'],
        dataPoints: mockData.dataPoints.filter(dp => dp.skillType === 'Tax Preparation'),
        totalDemand: 104.4,
        totalTasks: 1,
        totalClients: 1
      };
      
      render(
        <DemandMatrixGrid
          filteredData={filteredData}
          groupingMode="skill"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/104\.4h/)).toBeInTheDocument();
        expect(screen.queryByText(/52\.2h/)).not.toBeInTheDocument();
      });
      
      console.log('✅ [INTEGRATION] Filtering compatibility verified');
    });

    it('should ensure no regressions in other recurrence types', async () => {
      // Test that monthly, quarterly, and annual tasks still work correctly
      const mixedRecurrenceTasks: RecurringTaskDB[] = [
        // Monthly task
        {
          id: 'monthly-test',
          name: 'Monthly Test',
          template_id: 'template-monthly',
          client_id: 'client-test',
          estimated_hours: 10,
          required_skills: ['Testing'],
          recurrence_type: 'Monthly',
          recurrence_interval: 1,
          weekdays: null,
          is_active: true,
          priority: 'Medium',
          category: 'Test',
          status: 'Unscheduled',
          due_date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          description: 'Monthly test task',
          notes: null,
          day_of_month: 15,
          month_of_year: null,
          end_date: null,
          custom_offset_days: null,
          last_generated_date: null
        },
        // Quarterly task
        {
          id: 'quarterly-test',
          name: 'Quarterly Test',
          template_id: 'template-quarterly',
          client_id: 'client-test',
          estimated_hours: 20,
          required_skills: ['Analysis'],
          recurrence_type: 'Quarterly',
          recurrence_interval: 1,
          weekdays: null,
          is_active: true,
          priority: 'High',
          category: 'Test',
          status: 'Unscheduled',
          due_date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          description: 'Quarterly test task',
          notes: null,
          day_of_month: null,
          month_of_year: 1,
          end_date: null,
          custom_offset_days: null,
          last_generated_date: null
        }
      ];
      
      const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
        mixedRecurrenceTasks,
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      
      // Verify monthly task calculation (should be 10 hours for January)
      const testingSkill = skillHours.find(sh => sh.skill === 'Testing');
      expect(testingSkill?.hours).toBe(10);
      
      // Verify quarterly task calculation (should be 20 hours in first quarter)
      const analysisSkill = skillHours.find(sh => sh.skill === 'Analysis');
      expect(analysisSkill?.hours).toBe(20);
      
      console.log('✅ [INTEGRATION] No regressions in other recurrence types:', {
        monthlyHours: testingSkill?.hours,
        quarterlyHours: analysisSkill?.hours
      });
    });
  });

  describe('Manual Calculation Verification', () => {
    it('should produce results matching manually calculated expected values', async () => {
      // Test case with predictable values for manual verification
      const verificationTask: RecurringTaskDB = {
        id: 'verification-task',
        name: 'Verification Task',
        template_id: 'template-verification',
        client_id: 'client-verification',
        estimated_hours: 5, // 5 hours per occurrence
        required_skills: ['Verification'],
        recurrence_type: 'Weekly',
        recurrence_interval: 1, // Every week
        weekdays: [1, 2], // Monday and Tuesday only
        is_active: true,
        priority: 'Medium',
        category: 'Test',
        status: 'Unscheduled',
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Manual verification task',
        notes: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      };
      
      const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
        [verificationTask],
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      
      const verificationSkill = skillHours.find(sh => sh.skill === 'Verification');
      
      // Manual calculation:
      // 5 hours × 2 days/week × ~4.35 weeks/month = ~43.5 hours
      const expectedHours = 5 * 2 * (30.44 / 7); // Using exact average weeks per month
      const tolerance = expectedHours * 0.05; // 5% tolerance
      
      expect(verificationSkill?.hours).toBeCloseTo(expectedHours, 1);
      expect(Math.abs((verificationSkill?.hours || 0) - expectedHours)).toBeLessThan(tolerance);
      
      console.log('✅ [INTEGRATION] Manual calculation verification passed:', {
        calculatedHours: verificationSkill?.hours,
        expectedHours: expectedHours,
        difference: Math.abs((verificationSkill?.hours || 0) - expectedHours),
        tolerance: tolerance,
        withinTolerance: Math.abs((verificationSkill?.hours || 0) - expectedHours) < tolerance
      });
    });
  });
});
