
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap, Database, Filter } from 'lucide-react';
import { IntegrationTestService } from '@/services/forecasting/demand/performance/filtering/integrationTestService';

interface IntegrationTestPanelProps {
  onTestComplete?: (results: any) => void;
}

/**
 * PHASE 4: Integration Test Panel Component
 * 
 * Provides a comprehensive UI for running and viewing integration test results
 * with real data scenarios for the filtering pipeline.
 */
export const IntegrationTestPanel: React.FC<IntegrationTestPanelProps> = ({
  onTestComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState<string>('');

  /**
   * Run comprehensive integration tests
   */
  const handleRunTests = async () => {
    setIsRunning(true);
    setCurrentTest('Initializing tests...');
    
    try {
      console.log('🚀 [INTEGRATION TEST PANEL] Starting Phase 4 integration tests');
      
      // Update progress during test execution
      const progressUpdates = [
        'Generating test scenarios...',
        'Testing large dataset performance...',
        'Validating staff ID normalization...',
        'Testing edge cases...',
        'Analyzing performance metrics...',
        'Generating final report...'
      ];
      
      for (let i = 0; i < progressUpdates.length - 1; i++) {
        setCurrentTest(progressUpdates[i]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Run actual tests
      setCurrentTest('Running integration tests...');
      const results = await IntegrationTestService.runIntegrationTests();
      
      setCurrentTest('Finalizing results...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTestResults(results);
      setCurrentTest('');
      
      if (onTestComplete) {
        onTestComplete(results);
      }
      
      console.log('✅ [INTEGRATION TEST PANEL] Phase 4 integration tests completed', results);
      
    } catch (error) {
      console.error('❌ [INTEGRATION TEST PANEL] Integration test failed:', error);
      setTestResults({
        overallResult: 'FAIL',
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        totalExecutionTime: 0,
        results: [],
        summary: `Integration test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Clear test results
   */
  const handleClearResults = () => {
    setTestResults(null);
    setCurrentTest('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Phase 4: Integration Testing
        </CardTitle>
        <CardDescription>
          Comprehensive integration tests with real data scenarios to validate the filtering pipeline performance and accuracy.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex gap-4">
          <Button 
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Run Integration Tests
              </>
            )}
          </Button>
          
          {testResults && (
            <Button 
              variant="outline" 
              onClick={handleClearResults}
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Current Test Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {currentTest}
            </div>
            <Progress value={currentTest ? 70 : 10} className="w-full" />
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.passedTests}
                    </div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.failedTests}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {testResults.totalTests}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tests</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {testResults.totalExecutionTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {testResults.overallResult === 'PASS' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Overall Result: {testResults.overallResult}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(testResults.passedTests / testResults.totalTests) * 100} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="space-y-4">
              <div className="space-y-3">
                {testResults.results.map((result: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{result.scenario}</CardTitle>
                        <Badge variant={result.passed ? 'default' : 'destructive'}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Execution Time:</span>
                          <span className="ml-2 font-medium">{result.executionTime.toFixed(2)}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data Points:</span>
                          <span className="ml-2 font-medium">{result.actualDataPoints}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Range:</span>
                          <span className="ml-2 font-medium">
                            {result.expectedDataPoints.min}-{result.expectedDataPoints.max}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Filter Efficiency:</span>
                          <span className="ml-2 font-medium">
                            {(result.performanceMetrics.filterEfficiency * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {result.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <div className="text-sm text-red-800">
                            <strong>Errors:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {result.errors.map((error: string, idx: number) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {result.warnings.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <div className="text-sm text-yellow-800">
                            <strong>Warnings:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {result.warnings.map((warning: string, idx: number) => (
                                <li key={idx}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Execution Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fastest Test:</span>
                        <span className="font-medium">
                          {Math.min(...testResults.results.map((r: any) => r.executionTime)).toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slowest Test:</span>
                        <span className="font-medium">
                          {Math.max(...testResults.results.map((r: any) => r.executionTime)).toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span className="font-medium">
                          {(testResults.results.reduce((sum: number, r: any) => sum + r.executionTime, 0) / testResults.results.length).toFixed(2)}ms
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Filter Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best Efficiency:</span>
                        <span className="font-medium">
                          {(Math.max(...testResults.results.map((r: any) => r.performanceMetrics.filterEfficiency)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Worst Efficiency:</span>
                        <span className="font-medium">
                          {(Math.min(...testResults.results.map((r: any) => r.performanceMetrics.filterEfficiency)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span className="font-medium">
                          {(testResults.results.reduce((sum: number, r: any) => sum + r.performanceMetrics.filterEfficiency, 0) / testResults.results.length * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detailed Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                    {testResults.summary}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationTestPanel;
