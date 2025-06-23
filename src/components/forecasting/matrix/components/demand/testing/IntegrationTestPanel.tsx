
/**
 * Integration Test Panel Component
 * Provides UI for running comprehensive integration tests
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { CrossFilterIntegrationTester, IntegrationTestResult } from '@/services/forecasting/demand/performance/crossFilterIntegrationTester';
import { StaffDataOptimizer } from '@/services/forecasting/demand/performance/staffDataOptimizer';

interface IntegrationTestPanelProps {
  demandData: DemandMatrixData | null;
  className?: string;
}

export const IntegrationTestPanel: React.FC<IntegrationTestPanelProps> = ({
  demandData,
  className
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<IntegrationTestResult[]>([]);
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  const [realtimeResults, setRealtimeResults] = useState<any>(null);

  /**
   * Run comprehensive integration tests
   */
  const runIntegrationTests = async () => {
    if (!demandData) return;
    
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    
    try {
      // Fetch staff data for testing
      const { data: staffOptions } = await StaffDataOptimizer.fetchStaffDataOptimized();
      
      // Run cross-filter tests
      setProgress(25);
      const crossFilterResults = await CrossFilterIntegrationTester.runComprehensiveTests(
        demandData,
        staffOptions
      );
      setTestResults(crossFilterResults);
      
      // Run performance load tests
      setProgress(50);
      const performanceLoadResults = await CrossFilterIntegrationTester.testPerformanceUnderLoad(
        demandData,
        {
          iterations: 10,
          concurrentFilters: 5,
          dataMultiplier: 2
        }
      );
      setPerformanceResults(performanceLoadResults);
      
      // Run real-time update tests
      setProgress(75);
      const realtimeUpdateResults = await CrossFilterIntegrationTester.testRealtimeUpdatesWithStaffFiltering(
        demandData,
        staffOptions
      );
      setRealtimeResults(realtimeUpdateResults);
      
      setProgress(100);
      
    } catch (error) {
      console.error('Integration test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Reset all test results
   */
  const resetTests = () => {
    setTestResults([]);
    setPerformanceResults(null);
    setRealtimeResults(null);
    setProgress(0);
  };

  /**
   * Get overall test status
   */
  const getOverallStatus = () => {
    if (testResults.length === 0) return 'pending';
    
    const hasFailures = testResults.some(test => !test.passed);
    const hasPerformanceIssues = performanceResults && !performanceResults.passed;
    const hasRealtimeIssues = realtimeResults && !realtimeResults.dataConsistency;
    
    if (hasFailures || hasPerformanceIssues || hasRealtimeIssues) {
      return 'failed';
    }
    
    return 'passed';
  };

  const overallStatus = getOverallStatus();
  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Phase 5: Integration Testing Panel
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button
            onClick={runIntegrationTests}
            disabled={isRunning || !demandData}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetTests}
            disabled={isRunning}
          >
            Reset
          </Button>
          
          {totalTests > 0 && (
            <Badge variant={overallStatus === 'passed' ? 'default' : 'destructive'}>
              {passedTests}/{totalTests} Tests Passed
            </Badge>
          )}
        </div>
        
        {isRunning && (
          <Progress value={progress} className="w-full" />
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="cross-filter" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cross-filter">Cross-Filter Tests</TabsTrigger>
            <TabsTrigger value="performance">Performance Tests</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Tests</TabsTrigger>
          </TabsList>
          
          {/* Cross-Filter Integration Tests */}
          <TabsContent value="cross-filter" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cross-Filter Integration Results</h3>
              {testResults.length === 0 ? (
                <p className="text-muted-foreground">
                  Run tests to see cross-filter integration results
                </p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((test, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {test.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{test.testName}</span>
                            <Badge variant="outline">
                              {test.duration.toFixed(0)}ms
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Data Points: {test.dataPointsCount} | 
                            Filter: {test.performance.filterTime.toFixed(0)}ms | 
                            Calc: {test.performance.calculationTime.toFixed(0)}ms
                          </div>
                          
                          {test.errors.length > 0 && (
                            <div className="space-y-1">
                              {test.errors.map((error, errorIndex) => (
                                <div key={errorIndex} className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="h-3 w-3" />
                                  {error}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {test.warnings.length > 0 && (
                            <div className="space-y-1">
                              {test.warnings.map((warning, warningIndex) => (
                                <div key={warningIndex} className="flex items-center gap-2 text-sm text-yellow-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  {warning}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Performance Load Tests */}
          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Performance Load Test Results</h3>
              {!performanceResults ? (
                <p className="text-muted-foreground">
                  Run tests to see performance results
                </p>
              ) : (
                <Card className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Average Filter Time</div>
                      <div className="text-2xl font-bold">
                        {performanceResults.averageFilterTime.toFixed(0)}ms
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Max Filter Time</div>
                      <div className="text-2xl font-bold">
                        {performanceResults.maxFilterTime.toFixed(0)}ms
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                      <div className="text-2xl font-bold">
                        {performanceResults.memoryUsageMB.toFixed(1)}MB
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge variant={performanceResults.passed ? 'default' : 'destructive'}>
                        {performanceResults.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Real-time Update Tests */}
          <TabsContent value="realtime" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Real-time Update Test Results</h3>
              {!realtimeResults ? (
                <p className="text-muted-foreground">
                  Run tests to see real-time update results
                </p>
              ) : (
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Update Latency</div>
                      <div className="text-2xl font-bold">
                        {realtimeResults.updateLatency.toFixed(0)}ms
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Data Consistency</div>
                      <Badge variant={realtimeResults.dataConsistency ? 'default' : 'destructive'}>
                        {realtimeResults.dataConsistency ? 'CONSISTENT' : 'INCONSISTENT'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Performance Impact</div>
                      <div className="text-2xl font-bold">
                        {realtimeResults.performanceImpact.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
