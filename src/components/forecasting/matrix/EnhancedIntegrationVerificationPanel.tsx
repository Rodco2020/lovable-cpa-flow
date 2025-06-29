
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, RefreshCw, Bug, Zap, Shield } from 'lucide-react';
import { StaffFilteringIntegrationTestService, IntegrationTestResult } from '@/services/staff/integrationTestService';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';
import { StaffFilterValidationService } from '@/services/staff/staffFilterValidationService';

export const EnhancedIntegrationVerificationPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<IntegrationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const runIntegrationTests = async () => {
    setIsRunning(true);
    console.log('🧪 [INTEGRATION PANEL] Starting integration tests...');
    
    try {
      const results = await StaffFilteringIntegrationTestService.runComprehensiveTest();
      setTestResults(results);
      setLastRunTime(new Date());
      
      // Get cache stats
      const stats = UuidResolutionService.getCacheStats();
      setCacheStats(stats);
      
    } catch (error) {
      console.error('❌ [INTEGRATION PANEL] Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCache = () => {
    UuidResolutionService.clearCache();
    setCacheStats(UuidResolutionService.getCacheStats());
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  useEffect(() => {
    // Auto-run tests on component mount
    runIntegrationTests();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Enhanced Integration Verification Panel
        </CardTitle>
        <CardDescription>
          Comprehensive testing of the staff filtering system with UUID resolution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
            <TabsTrigger value="cache">Cache Status</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Tests Passed</p>
                      <p className="text-2xl font-bold">{passedTests}/{totalTests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Last Run</p>
                      <p className="text-sm text-muted-foreground">
                        {lastRunTime ? lastRunTime.toLocaleTimeString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button onClick={runIntegrationTests} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Integration Tests
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearCache}>
                Clear Cache
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            {testResults.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No test results available</p>
                <p className="text-sm text-gray-500 mt-1">Run the integration tests to see results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className={`border-l-4 ${result.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{result.testName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.passed ? "default" : "destructive"}>
                            {result.passed ? 'PASSED' : 'FAILED'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.duration.toFixed(2)}ms
                          </span>
                        </div>
                      </div>
                      
                      {result.issues.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-600">Issues:</p>
                          <ul className="text-sm text-red-500 list-disc list-inside">
                            {result.issues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-amber-600">Recommendations:</p>
                          <ul className="text-sm text-amber-500 list-disc list-inside">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            {cacheStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm font-medium">Cache Size</p>
                      <p className="text-2xl font-bold">{cacheStats.cacheSize}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm font-medium">Cache Age</p>
                      <p className="text-2xl font-bold">{(cacheStats.cacheAge / 1000).toFixed(1)}s</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm font-medium">Cache Status</p>
                      <Badge variant={cacheStats.isValid ? "default" : "secondary"}>
                        {cacheStats.isValid ? 'Valid' : 'Expired'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground">No cache statistics available</p>
            )}
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Implementation Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">UUID Resolution Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Filter Validation Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Enhanced Marciano Report</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Integration Testing</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Improvements</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Replaced hardcoded names with dynamic UUID resolution</li>
                      <li>Added comprehensive filter validation</li>
                      <li>Implemented caching for improved performance</li>
                      <li>Enhanced logging and error handling</li>
                      <li>Added end-to-end integration testing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
