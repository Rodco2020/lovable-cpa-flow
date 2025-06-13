
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phase4ComprehensiveTestRunner, 
  Phase4CompletionReport 
} from '@/services/forecasting/matrix/testing/Phase4ComprehensiveTestRunner';
import { Phase4TestingSuite } from '@/services/forecasting/matrix/testing/Phase4TestingSuite';
import { TechnicalDocumentationUpdater } from '@/services/forecasting/matrix/documentation/TechnicalDocumentationUpdater';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  FileText, 
  Activity,
  Clock,
  Users,
  Zap
} from 'lucide-react';

/**
 * Phase 4 Testing Interface Component
 * 
 * Provides UI for executing and viewing Phase 4 comprehensive testing results
 */
export const Phase4TestingInterface: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [completionReport, setCompletionReport] = useState<Phase4CompletionReport | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();

  const runPhase4Tests = async () => {
    setIsRunning(true);
    try {
      toast({
        title: "Starting Phase 4 Testing",
        description: "Running comprehensive system tests...",
      });

      const report = await Phase4ComprehensiveTestRunner.runPhase4Complete();
      setCompletionReport(report);

      const statusConfig = {
        SUCCESS: { variant: "default" as const, title: "Phase 4 Completed Successfully" },
        PARTIAL: { variant: "destructive" as const, title: "Phase 4 Completed with Warnings" },
        FAILED: { variant: "destructive" as const, title: "Phase 4 Failed" }
      };

      const config = statusConfig[report.completionStatus];
      
      toast({
        title: config.title,
        description: `${report.testingReport.summary.passedTests}/${report.testingReport.summary.totalTests} tests passed`,
        variant: config.variant
      });

    } catch (error) {
      toast({
        title: "Phase 4 Testing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadDocumentation = () => {
    if (!completionReport) return;

    const documentation = TechnicalDocumentationUpdater.generateCompleteTechnicalDocumentation(
      completionReport.testingReport
    );

    const blob = new Blob([documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forecasting-matrix-technical-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Documentation Downloaded",
      description: "Technical documentation has been saved",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PARTIAL':
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PASS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL':
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'FAIL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Phase 4: Comprehensive System Testing
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                End-to-end testing, regression validation, and documentation updates
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runPhase4Tests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running Tests...' : 'Run Phase 4 Tests'}
              </Button>
              {completionReport && (
                <Button 
                  variant="outline" 
                  onClick={downloadDocumentation}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Docs
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      {completionReport && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="end-to-end">End-to-End</TabsTrigger>
            <TabsTrigger value="regression">Regression</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(completionReport.completionStatus)}
                    <div>
                      <p className="text-sm font-medium">Overall Status</p>
                      <p className="text-2xl font-bold">{completionReport.completionStatus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Tests Passed</p>
                      <p className="text-2xl font-bold">
                        {completionReport.testingReport.summary.passedTests}/
                        {completionReport.testingReport.summary.totalTests}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">
                        {((completionReport.testingReport.summary.passedTests / 
                           completionReport.testingReport.summary.totalTests) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {completionReport.deploymentReadiness.ready ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> :
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <div>
                      <p className="text-sm font-medium">Deployment</p>
                      <p className="text-2xl font-bold">
                        {completionReport.deploymentReadiness.ready ? 'Ready' : 'Blocked'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-sm whitespace-pre-wrap">
                    {Phase4ComprehensiveTestRunner.generateExecutiveSummary(completionReport)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* End-to-End Testing Tab */}
          <TabsContent value="end-to-end">
            <Card>
              <CardHeader>
                <CardTitle>End-to-End Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completionReport.testingReport.endToEndTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.passed ? 'PASS' : 'FAIL')}
                          <h4 className="font-medium">{test.scenario}</h4>
                        </div>
                        <Badge className={getStatusColor(test.passed ? 'PASS' : 'FAIL')}>
                          {test.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-1 font-medium">{test.duration}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Steps:</span>
                          <span className="ml-1 font-medium">
                            {test.steps.filter(s => s.passed).length}/{test.steps.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data Load:</span>
                          <span className="ml-1 font-medium">{test.performanceMetrics.dataLoadTime}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <span className="ml-1 font-medium">
                            {(test.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </div>
                      </div>

                      {test.criticalIssues.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-800 mb-1">Critical Issues:</p>
                          <ul className="text-sm text-red-700 list-disc list-inside">
                            {test.criticalIssues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regression Testing Tab */}
          <TabsContent value="regression">
            <Card>
              <CardHeader>
                <CardTitle>Regression Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completionReport.testingReport.regressionTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.passed ? 'PASS' : 'FAIL')}
                          <h4 className="font-medium">{test.component}</h4>
                          <Badge variant="outline">{test.testType}</Badge>
                        </div>
                        <Badge className={getStatusColor(test.passed ? 'PASS' : 'FAIL')}>
                          {test.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>

                      {test.issues.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-medium text-yellow-800 mb-1">Issues:</p>
                          <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {test.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {test.recommendations.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-800 mb-1">Recommendations:</p>
                          <ul className="text-sm text-blue-700 list-disc list-inside">
                            {test.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Load Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completionReport.testingReport.loadTests.map((test, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{test.scenario}</h4>
                          <Badge className={getStatusColor(test.passed ? 'PASS' : 'FAIL')}>
                            {test.passed ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Users:</span>
                            <span className="ml-1 font-medium">{test.concurrentUsers}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="ml-1 font-medium">{test.errorRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Response:</span>
                            <span className="ml-1 font-medium">{test.averageResponseTime.toFixed(0)}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">RPS:</span>
                            <span className="ml-1 font-medium">{test.requestsPerSecond.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edge Case Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completionReport.testingReport.edgeCaseTests.map((test, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{test.scenario}</h4>
                          <Badge className={getStatusColor(test.passed && test.errorHandled ? 'PASS' : 'FAIL')}>
                            {test.passed && test.errorHandled ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{test.testCase}</p>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {test.passed ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            <span>Test Passed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {test.errorHandled ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            <span>Error Handled</span>
                          </div>
                        </div>

                        {test.issues.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <ul className="text-sm text-red-700 list-disc list-inside">
                              {test.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {completionReport.deploymentReadiness.ready ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> :
                      <XCircle className="h-5 w-5 text-red-500" />
                    }
                    Deployment Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Badge className={
                        completionReport.deploymentReadiness.ready ? 
                        'bg-green-100 text-green-800 border-green-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }>
                        {completionReport.deploymentReadiness.ready ? 'READY' : 'BLOCKED'}
                      </Badge>
                    </div>

                    {completionReport.deploymentReadiness.blockers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Deployment Blockers:</h4>
                        <ul className="space-y-1">
                          {completionReport.deploymentReadiness.blockers.map((blocker, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {completionReport.deploymentReadiness.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {completionReport.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Running Phase 4 Testing Suite</p>
                <p className="text-sm text-muted-foreground">
                  This may take several minutes to complete...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Phase4TestingInterface;
