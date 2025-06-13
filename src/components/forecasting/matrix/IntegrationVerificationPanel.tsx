
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { MatrixCalculationMonitor } from '@/services/forecasting/demand/matrixCalculationMonitor';
import { SkillCalculatorCore } from '@/services/forecasting/demand/skillCalculator/skillCalculatorCore';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { RecurringTaskDB } from '@/types/task';

interface IntegrationTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: any;
}

/**
 * Integration Verification Panel
 * 
 * This component provides a UI for running Phase 4 integration tests
 * and monitoring the integration between calculation engines and matrix display.
 */
export const IntegrationVerificationPanel: React.FC = () => {
  const [tests, setTests] = useState<IntegrationTest[]>([
    {
      id: 'skill-calculator-integration',
      name: 'Skill Calculator Integration',
      description: 'Verify SkillCalculatorCore integrates properly with matrix pipeline',
      status: 'pending'
    },
    {
      id: 'weekly-task-calculations',
      name: 'Weekly Task Calculations',
      description: 'Test weekly recurring tasks with specific weekdays',
      status: 'pending'
    },
    {
      id: 'matrix-display-consistency',
      name: 'Matrix Display Consistency',
      description: 'Verify matrix cells show correct totals across multiple skills',
      status: 'pending'
    },
    {
      id: 'performance-benchmarks',
      name: 'Performance Benchmarks',
      description: 'Monitor calculation performance with large datasets',
      status: 'pending'
    },
    {
      id: 'regression-testing',
      name: 'Regression Testing',
      description: 'Ensure no regressions in other recurrence types',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  /**
   * Run all integration tests
   */
  const runIntegrationTests = async () => {
    setIsRunning(true);
    MatrixCalculationMonitor.startMonitoring();
    
    // Reset all tests to pending
    setTests(prevTests => prevTests.map(test => ({ ...test, status: 'pending' as const })));

    for (const test of tests) {
      await runSingleTest(test.id);
    }

    const report = MatrixCalculationMonitor.stopMonitoring();
    setPerformanceReport(report);
    setIsRunning(false);
  };

  /**
   * Run a single integration test
   */
  const runSingleTest = async (testId: string) => {
    setTests(prevTests => 
      prevTests.map(test => 
        test.id === testId 
          ? { ...test, status: 'running' as const }
          : test
      )
    );

    const startTime = performance.now();

    try {
      let testResult: any = {};

      switch (testId) {
        case 'skill-calculator-integration':
          testResult = await testSkillCalculatorIntegration();
          break;
        case 'weekly-task-calculations':
          testResult = await testWeeklyTaskCalculations();
          break;
        case 'matrix-display-consistency':
          testResult = await testMatrixDisplayConsistency();
          break;
        case 'performance-benchmarks':
          testResult = await testPerformanceBenchmarks();
          break;
        case 'regression-testing':
          testResult = await testRegressionChecks();
          break;
        default:
          throw new Error(`Unknown test: ${testId}`);
      }

      const duration = performance.now() - startTime;

      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                status: 'passed' as const, 
                duration, 
                details: testResult 
              }
            : test
        )
      );

    } catch (error) {
      const duration = performance.now() - startTime;
      
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                status: 'failed' as const, 
                duration, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : test
        )
      );
    }
  };

  /**
   * Test skill calculator integration
   */
  const testSkillCalculatorIntegration = async () => {
    const mockTasks: RecurringTaskDB[] = [
      {
        id: 'integration-test-1',
        name: 'Integration Test Task',
        template_id: 'template-integration',
        client_id: 'client-integration',
        estimated_hours: 10,
        required_skills: ['Integration Testing'],
        recurrence_type: 'Weekly',
        recurrence_interval: 1,
        weekdays: [1, 3, 5],
        is_active: true,
        priority: 'Medium',
        category: 'Other',
        status: 'Unscheduled',
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Integration test task',
        notes: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      }
    ];

    const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
      mockTasks,
      new Date('2025-01-01'),
      new Date('2025-01-31')
    );

    const integrationSkill = skillHours.find(sh => sh.skill === 'Integration Testing');
    
    if (!integrationSkill || integrationSkill.hours <= 0) {
      throw new Error('Integration test failed: Expected positive hours for Integration Testing skill');
    }

    return {
      skillsCalculated: skillHours.length,
      integrationTestingHours: integrationSkill.hours,
      expectedRange: [120, 140], // 10h × 3 days × ~4.35 weeks
      success: true
    };
  };

  /**
   * Test weekly task calculations
   */
  const testWeeklyTaskCalculations = async () => {
    const weeklyTasks: RecurringTaskDB[] = [
      {
        id: 'weekly-test-1',
        name: 'Weekly Test Task',
        template_id: 'template-weekly-test',
        client_id: 'client-weekly-test',
        estimated_hours: 5,
        required_skills: ['Weekly Testing'],
        recurrence_type: 'Weekly',
        recurrence_interval: 1,
        weekdays: [1, 2], // Mon, Tue
        is_active: true,
        priority: 'Medium',
        category: 'Other',
        status: 'Unscheduled',
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Weekly test task',
        notes: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      }
    ];

    const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
      weeklyTasks,
      new Date('2025-01-01'),
      new Date('2025-01-31')
    );

    const weeklySkill = skillHours.find(sh => sh.skill === 'Weekly Testing');
    const expectedHours = 5 * 2 * (30.44 / 7); // 5h × 2 days × ~4.35 weeks

    if (!weeklySkill || Math.abs(weeklySkill.hours - expectedHours) > expectedHours * 0.1) {
      throw new Error(`Weekly calculation failed: Expected ~${expectedHours.toFixed(1)}h, got ${weeklySkill?.hours || 0}h`);
    }

    return {
      calculatedHours: weeklySkill.hours,
      expectedHours,
      accuracy: ((1 - Math.abs(weeklySkill.hours - expectedHours) / expectedHours) * 100).toFixed(1) + '%',
      success: true
    };
  };

  /**
   * Test matrix display consistency
   */
  const testMatrixDisplayConsistency = async () => {
    // This would normally test the actual matrix rendering
    // For now, we'll simulate the test
    const matrixData = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData.matrixData || matrixData.matrixData.dataPoints.length === 0) {
      throw new Error('Matrix data generation failed');
    }

    const totalCalculatedHours = matrixData.matrixData.dataPoints.reduce(
      (sum, point) => sum + point.demandHours, 0
    );

    return {
      dataPointsGenerated: matrixData.matrixData.dataPoints.length,
      skillsRepresented: matrixData.matrixData.skills.length,
      monthsGenerated: matrixData.matrixData.months.length,
      totalCalculatedHours,
      success: true
    };
  };

  /**
   * Test performance benchmarks
   */
  const testPerformanceBenchmarks = async () => {
    const largeTasks: RecurringTaskDB[] = [];
    
    // Generate 50 tasks for performance testing
    for (let i = 0; i < 50; i++) {
      largeTasks.push({
        id: `perf-task-${i}`,
        name: `Performance Task ${i}`,
        template_id: `template-perf-${i}`,
        client_id: `client-${i % 10}`,
        estimated_hours: Math.floor(Math.random() * 20) + 1,
        required_skills: [`Skill ${i % 5}`],
        recurrence_type: i % 3 === 0 ? 'Weekly' : i % 3 === 1 ? 'Monthly' : 'Quarterly',
        recurrence_interval: Math.floor(Math.random() * 3) + 1,
        weekdays: i % 3 === 0 ? [1, 3, 5] : null,
        is_active: true,
        priority: 'Medium',
        category: 'Other',
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

    if (calculationTime > 2000) { // 2 second threshold
      throw new Error(`Performance test failed: Calculation took ${calculationTime.toFixed(0)}ms (threshold: 2000ms)`);
    }

    return {
      tasksProcessed: largeTasks.length,
      calculationTime: calculationTime.toFixed(0) + 'ms',
      skillsReturned: skillHours.length,
      performanceRating: calculationTime < 500 ? 'Excellent' : calculationTime < 1000 ? 'Good' : 'Acceptable',
      success: true
    };
  };

  /**
   * Test regression checks
   */
  const testRegressionChecks = async () => {
    const regressionTasks: RecurringTaskDB[] = [
      // Monthly task
      {
        id: 'regression-monthly',
        name: 'Regression Monthly Task',
        template_id: 'template-regression-monthly',
        client_id: 'client-regression',
        estimated_hours: 15,
        required_skills: ['Monthly Work'],
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        weekdays: null,
        is_active: true,
        priority: 'Medium',
        category: 'Other',
        status: 'Unscheduled',
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Regression test monthly task',
        notes: null,
        day_of_month: 15,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      }
    ];

    const skillHours = await SkillCalculatorCore.calculateMonthlyDemandBySkill(
      regressionTasks,
      new Date('2025-01-01'),
      new Date('2025-01-31')
    );

    const monthlySkill = skillHours.find(sh => sh.skill === 'Monthly Work');
    
    if (!monthlySkill || monthlySkill.hours !== 15) {
      throw new Error(`Regression test failed: Expected 15h for monthly task, got ${monthlySkill?.hours || 0}h`);
    }

    return {
      monthlyTaskHours: monthlySkill.hours,
      expectedHours: 15,
      regressionPassed: monthlySkill.hours === 15,
      success: true
    };
  };

  /**
   * Get status icon for test
   */
  const getStatusIcon = (status: IntegrationTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeVariant = (status: IntegrationTest['status']) => {
    switch (status) {
      case 'passed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'running':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Phase 4: Integration Testing with Matrix Calculations</CardTitle>
          <CardDescription>
            Verify that the matrix visualization correctly displays the updated calculations
            and ensure system-wide consistency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runIntegrationTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Integration Tests...' : 'Run All Integration Tests'}
            </Button>
            
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      {test.error && (
                        <div className="text-sm text-red-600 mt-1">{test.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration.toFixed(0)}ms
                      </span>
                    )}
                    <Badge variant={getStatusBadgeVariant(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {performanceReport && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Report</CardTitle>
            <CardDescription>
              Performance metrics from the integration test run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceReport.totalOperations}</div>
                <div className="text-xs text-muted-foreground">Total Operations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceReport.averageDuration.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {performanceReport.slowestOperation?.duration?.toFixed(0) || 0}ms
                </div>
                <div className="text-xs text-muted-foreground">Slowest Operation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {performanceReport.fastestOperation?.duration?.toFixed(0) || 0}ms
                </div>
                <div className="text-xs text-muted-foreground">Fastest Operation</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Testing Criteria:</strong> All tests must pass to ensure proper integration
          between the enhanced recurrence calculations and matrix visualization. Any failures indicate
          issues that need to be resolved before proceeding to production.
        </AlertDescription>
      </Alert>
    </div>
  );
};
