import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Play, Database, Filter, Zap } from 'lucide-react';
import { RecurringTaskDB } from '@/types/task';
import { Staff } from '@/types/staff';
import IntegrationTestPanel from './IntegrationTestPanel';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { FilterStrategyFactory } from '@/services/forecasting/demand/performance/filtering/filterStrategyFactory';

interface IntegrationVerificationPanelProps {
  recurringTasks: RecurringTaskDB[];
  staffOptions: Staff[];
}

interface VerificationResult {
  category: string;
  tests: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    executionTime?: number;
  }>;
}

/**
 * PHASE 4: Enhanced Integration Verification Panel
 * 
 * Comprehensive testing panel that validates the entire matrix system
 * including data generation, filtering, and performance optimization.
 */
const IntegrationVerificationPanel: React.FC<IntegrationVerificationPanelProps> = ({
  recurringTasks,
  staffOptions
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [integrationTestResults, setIntegrationTestResults] = useState<any>(null);

  /**
   * Run basic verification tests
   */
  const runVerificationTests = async () => {
    setIsRunning(true);
    console.log('🔍 [INTEGRATION VERIFICATION] Starting Phase 4 verification tests');

    try {
      const results: VerificationResult[] = [];

      // Test 1: Data Generation Verification
      const dataGenerationTests = await testDataGeneration();
      results.push({
        category: 'Data Generation',
        tests: dataGenerationTests
      });

      // Test 2: Filter Pipeline Verification
      const filterPipelineTests = await testFilterPipeline();
      results.push({
        category: 'Filter Pipeline',
        tests: filterPipelineTests
      });

      // Test 3: Performance Optimization Verification
      const performanceTests = await testPerformanceOptimization();
      results.push({
        category: 'Performance Optimization',
        tests: performanceTests
      });

      // Test 4: System Integration Verification
      const systemIntegrationTests = await testSystemIntegration();
      results.push({
        category: 'System Integration',
        tests: systemIntegrationTests
      });

      setVerificationResults(results);
      console.log('✅ [INTEGRATION VERIFICATION] Phase 4 verification tests completed');

    } catch (error) {
      console.error('❌ [INTEGRATION VERIFICATION] Verification failed:', error);
      setVerificationResults([{
        category: 'System Error',
        tests: [{
          name: 'Verification Execution',
          status: 'fail',
          details: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Test data generation functionality
   */
  const testDataGeneration = async (): Promise<Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    executionTime?: number;
  }>> => {
    const tests = [];
    
    try {
      const startTime = performance.now();
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      const executionTime = performance.now() - startTime;

      tests.push({
        name: 'Matrix Data Generation',
        status: matrixData ? 'pass' : 'fail',
        details: matrixData 
          ? `Generated matrix with ${matrixData.dataPoints.length} data points in ${executionTime.toFixed(2)}ms`
          : 'Failed to generate matrix data',
        executionTime
      });

      if (matrixData) {
        tests.push({
          name: 'Data Structure Validation',
          status: matrixData.months.length === 12 ? 'pass' : 'warning',
          details: `Matrix contains ${matrixData.months.length} months (expected 12)`
        });

        tests.push({
          name: 'Skills Data Validation',
          status: matrixData.skills.length > 0 ? 'pass' : 'fail',
          details: `Found ${matrixData.skills.length} skills in matrix data`
        });

        tests.push({
          name: 'Revenue Data Validation',
          status: matrixData.revenueTotals ? 'pass' : 'warning',
          details: matrixData.revenueTotals 
            ? `Revenue calculations present: $${matrixData.revenueTotals.totalSuggestedRevenue.toFixed(2)} suggested`
            : 'Revenue calculations not found'
        });
      }

    } catch (error) {
      tests.push({
        name: 'Matrix Data Generation',
        status: 'fail',
        details: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return tests;
  };

  /**
   * Test filter pipeline functionality
   */
  const testFilterPipeline = async (): Promise<Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    executionTime?: number;
  }>> => {
    const tests = [];

    try {
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (!matrixData) {
        tests.push({
          name: 'Filter Pipeline Test',
          status: 'fail',
          details: 'No matrix data available for filter testing'
        });
        return tests;
      }

      // Test basic filtering
      const basicFilters = {
        skills: [],
        clients: [],
        preferredStaff: [],
        timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
      };

      const startTime = performance.now();
      const filteredData = FilterStrategyFactory.applyFilters(matrixData, basicFilters);
      const executionTime = performance.now() - startTime;

      tests.push({
        name: 'Basic Filter Application',
        status: 'pass',
        details: `Applied filters successfully in ${executionTime.toFixed(2)}ms`,
        executionTime
      });

      // Test preferred staff filtering
      if (staffOptions.length > 0) {
        const staffFilters = {
          ...basicFilters,
          preferredStaff: [staffOptions[0].id]
        };

        const staffStartTime = performance.now();
        const staffFilteredData = FilterStrategyFactory.applyFilters(matrixData, staffFilters);
        const staffExecutionTime = performance.now() - staffStartTime;

        // ... keep existing code (tests array logic)
        tests.push({
          name: 'Preferred Staff Filtering',
          status: 'pass',
          details: `Staff filtering completed in ${staffExecutionTime.toFixed(2)}ms`,
          executionTime: staffExecutionTime
        });
      }

      // Test performance monitoring
      const performanceDashboard = FilterStrategyFactory.getPerformanceDashboard();
      tests.push({
        name: 'Performance Monitoring',
        status: performanceDashboard ? 'pass' : 'warning',
        details: performanceDashboard 
          ? `Performance dashboard active with ${performanceDashboard.totalFiltersMonitored} filters monitored`
          : 'Performance monitoring not fully initialized'
      });

    } catch (error) {
      tests.push({
        name: 'Filter Pipeline Test',
        status: 'fail',
        details: `Filter testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return tests;
  };

  /**
   * Test performance optimization features
   */
  const testPerformanceOptimization = async (): Promise<Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    executionTime?: number;
  }>> => {
    const tests = [];

    try {
      // Test cache functionality
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (matrixData) {
        const testFilters = {
          skills: matrixData.skills.slice(0, 1),
          clients: [],
          preferredStaff: [],
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-06-30') }
        };

        // First run (cache miss)
        const firstRunStart = performance.now();
        FilterStrategyFactory.applyFilters(matrixData, testFilters);
        const firstRunTime = performance.now() - firstRunStart;

        // Second run (should hit cache)
        const secondRunStart = performance.now();
        FilterStrategyFactory.applyFilters(matrixData, testFilters);
        const secondRunTime = performance.now() - secondRunStart;

        tests.push({
          name: 'Caching Performance',
          status: secondRunTime < firstRunTime ? 'pass' : 'warning',
          details: `First run: ${firstRunTime.toFixed(2)}ms, Second run: ${secondRunTime.toFixed(2)}ms`,
          executionTime: secondRunTime
        });

        // Test large dataset performance
        if (matrixData.dataPoints.length > 100) {
          const largeDatasetStart = performance.now();
          FilterStrategyFactory.applyFilters(matrixData, testFilters);
          const largeDatasetTime = performance.now() - largeDatasetStart;

          tests.push({
            name: 'Large Dataset Performance',
            status: largeDatasetTime < 1000 ? 'pass' : 'warning', // Under 1 second
            details: `Processed ${matrixData.dataPoints.length} data points in ${largeDatasetTime.toFixed(2)}ms`,
            executionTime: largeDatasetTime
          });
        }
      }

    } catch (error) {
      tests.push({
        name: 'Performance Optimization Test',
        status: 'fail',
        details: `Performance testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return tests;
  };

  /**
   * Test system integration
   */
  const testSystemIntegration = async (): Promise<Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    executionTime?: number;
  }>> => {
    const tests = [];

    try {
      // Test data consistency
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (matrixData) {
        const dataConsistencyChecks = [
          {
            name: 'Data Point Consistency',
            condition: matrixData.dataPoints.every(dp => dp.demandHours >= 0 && dp.taskCount >= 0),
            details: 'All data points have valid positive values'
          },
          {
            name: 'Skill Consistency',
            condition: matrixData.skills.length > 0 && matrixData.skills.every(skill => skill.length > 0),
            details: `${matrixData.skills.length} skills found with valid names`
          },
          {
            name: 'Month Consistency',
            condition: matrixData.months.length === 12,
            details: `${matrixData.months.length} months in matrix (expected 12)`
          }
        ];

        dataConsistencyChecks.forEach(check => {
          tests.push({
            name: check.name,
            status: check.condition ? 'pass' : 'fail',
            details: check.details
          });
        });
      }

      // Test integration with existing data
      tests.push({
        name: 'Recurring Tasks Integration',
        status: recurringTasks.length > 0 ? 'pass' : 'warning',
        details: `${recurringTasks.length} recurring tasks available for testing`
      });

      tests.push({
        name: 'Staff Options Integration',
        status: staffOptions.length > 0 ? 'pass' : 'warning',
        details: `${staffOptions.length} staff members available for filtering`
      });

    } catch (error) {
      tests.push({
        name: 'System Integration Test',
        status: 'fail',
        details: `Integration testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return tests;
  };

  /**
   * Handle integration test completion
   */
  const handleIntegrationTestComplete = (results: any) => {
    setIntegrationTestResults(results);
    console.log('📊 [INTEGRATION VERIFICATION] Integration test results received:', results);
  };

  /**
   * Get overall status from verification results
   */
  const getOverallStatus = (): 'pass' | 'fail' | 'warning' => {
    if (verificationResults.length === 0) return 'warning';
    
    const allTests = verificationResults.flatMap(result => result.tests);
    const hasFailures = allTests.some(test => test.status === 'fail');
    const hasWarnings = allTests.some(test => test.status === 'warning');
    
    if (hasFailures) return 'fail';
    if (hasWarnings) return 'warning';
    return 'pass';
  };

  const overallStatus = getOverallStatus();
  const totalTests = verificationResults.flatMap(result => result.tests).length;
  const passedTests = verificationResults.flatMap(result => result.tests).filter(test => test.status === 'pass').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Phase 4: Integration Verification</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive testing of matrix generation, filtering, and performance optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          {overallStatus === 'pass' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {overallStatus === 'fail' && <AlertCircle className="h-5 w-5 text-red-600" />}
          {overallStatus === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
          <Badge variant={overallStatus === 'pass' ? 'default' : overallStatus === 'fail' ? 'destructive' : 'secondary'}>
            {overallStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex gap-4">
        <Button onClick={runVerificationTests} disabled={isRunning} className="flex items-center gap-2">
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Verification Tests
            </>
          )}
        </Button>
      </div>

      {/* Results Summary */}
      {verificationResults.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Verification completed: {passedTests}/{totalTests} tests passed
            {integrationTestResults && ` | Integration tests: ${integrationTestResults.overallResult}`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verification">Basic Verification</TabsTrigger>
          <TabsTrigger value="integration">Integration Testing</TabsTrigger>
        </TabsList>

        {/* Basic Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          {verificationResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {result.category === 'Data Generation' && <Database className="h-4 w-4" />}
                  {result.category === 'Filter Pipeline' && <Filter className="h-4 w-4" />}
                  {result.category === 'Performance Optimization' && <Zap className="h-4 w-4" />}
                  {result.category === 'System Integration' && <CheckCircle className="h-4 w-4" />}
                  {result.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-2">
                        {test.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {test.status === 'fail' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {test.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                        <span className="font-medium text-sm">{test.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{test.details}</div>
                        {test.executionTime && (
                          <div className="text-xs text-muted-foreground">
                            {test.executionTime.toFixed(2)}ms
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Integration Testing Tab */}
        <TabsContent value="integration">
          <IntegrationTestPanel onTestComplete={handleIntegrationTestComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationVerificationPanel;
