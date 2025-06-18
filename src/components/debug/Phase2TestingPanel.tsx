
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Cog, 
  Database, 
  TestTube, 
  FileText 
} from 'lucide-react';
import {
  testServiceMethod,
  quickServiceTest,
  validateStaffExists,
  type ServiceValidationReport
} from '@/services/taskService/serviceValidationService';

const Phase2TestingPanel: React.FC = () => {
  const [taskId, setTaskId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [customUpdates, setCustomUpdates] = useState('{\n  "preferredStaffId": null\n}');
  const [validationReport, setValidationReport] = useState<ServiceValidationReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    setTestLogs(prev => [...prev, logEntry]);
    console.log(`[Phase2Testing] ${logEntry}`);
  };

  const clearResults = () => {
    setValidationReport(null);
    setTestLogs([]);
  };

  // Test 1: Staff ID Validation
  const testStaffValidation = async () => {
    if (!staffId) {
      toast.error('Please enter a Staff ID to test');
      return;
    }

    addLog(`Testing staff validation for ID: ${staffId}`);
    
    try {
      const exists = await validateStaffExists(staffId);
      addLog(`Staff validation result: ${exists ? 'EXISTS' : 'NOT_FOUND'}`);
      
      if (exists) {
        toast.success(`Staff ${staffId} exists and is active`);
      } else {
        toast.error(`Staff ${staffId} does not exist or is inactive`);
      }
    } catch (error) {
      addLog(`Staff validation error: ${error}`);
      toast.error('Staff validation failed');
    }
  };

  // Test 2: Quick Service Method Test
  const runQuickServiceTest = async () => {
    if (!taskId) {
      toast.error('Please enter a Task ID');
      return;
    }

    addLog(`Running quick service test: ${taskId} → ${staffId || 'null'}`);
    
    try {
      const success = await quickServiceTest(taskId, staffId || null);
      addLog(`Quick service test result: ${success ? 'PASSED' : 'FAILED'}`);
      
      if (success) {
        toast.success('Quick service test passed!');
      } else {
        toast.error('Quick service test failed');
      }
    } catch (error) {
      addLog(`Quick service test error: ${error}`);
      toast.error('Quick service test failed');
    }
  };

  // Test 3: Comprehensive Service Method Test
  const runComprehensiveTest = async () => {
    if (!taskId) {
      toast.error('Please enter a Task ID');
      return;
    }

    setIsRunningTests(true);
    clearResults();
    addLog('Starting comprehensive service method test');

    try {
      let updates;
      try {
        updates = JSON.parse(customUpdates);
      } catch {
        updates = { preferredStaffId: staffId || null };
      }

      addLog(`Test updates: ${JSON.stringify(updates)}`);
      
      const report = await testServiceMethod(taskId, updates);
      setValidationReport(report);
      
      addLog(`Comprehensive test completed: ${report.summary}`);
      
      if (report.failedTests === 0) {
        toast.success('All tests passed!');
      } else {
        toast.warning(`${report.failedTests} test(s) failed`);
      }
    } catch (error) {
      addLog(`Comprehensive test error: ${error}`);
      toast.error('Comprehensive test failed');
    } finally {
      setIsRunningTests(false);
    }
  };

  // Test 4: Data Transformation Test
  const testDataTransformation = async () => {
    addLog('Testing data transformation independently');
    
    try {
      let testData;
      try {
        testData = JSON.parse(customUpdates);
      } catch {
        testData = { preferredStaffId: staffId || null };
      }

      const { transformApplicationToDatabase } = await import('@/services/taskService/dataTransformationService');
      const { validateDataTransformation } = await import('@/services/taskService/serviceValidationService');
      
      const transformed = transformApplicationToDatabase(testData);
      const validationResults = validateDataTransformation(testData, transformed);
      
      addLog(`Transformation test results: ${validationResults.length} checks`);
      
      const passed = validationResults.filter(r => r.success).length;
      const failed = validationResults.filter(r => !r.success).length;
      
      if (failed === 0) {
        toast.success(`Data transformation test passed (${passed} checks)`);
      } else {
        toast.error(`Data transformation test failed (${failed} failures)`);
      }
      
      addLog(`Transformation results: ${passed} passed, ${failed} failed`);
    } catch (error) {
      addLog(`Transformation test error: ${error}`);
      toast.error('Transformation test failed');
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cog className="h-6 w-6" />
          Phase 2: Service Layer Validation and Enhancement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="taskId">Task ID for Testing</Label>
            <Input
              id="taskId"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter recurring task ID"
            />
          </div>
          <div>
            <Label htmlFor="staffId">Staff ID for Testing</Label>
            <Input
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter staff member ID (optional)"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="customUpdates">Custom Update Data (JSON)</Label>
          <Textarea
            id="customUpdates"
            value={customUpdates}
            onChange={(e) => setCustomUpdates(e.target.value)}
            className="font-mono text-sm"
            rows={4}
            placeholder="Enter JSON object with fields to update"
          />
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testStaffValidation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Validate Staff ID
          </Button>
          <Button 
            onClick={runQuickServiceTest}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Quick Service Test
          </Button>
          <Button 
            onClick={testDataTransformation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Cog className="h-4 w-4" />
            Test Transformation
          </Button>
          <Button 
            onClick={runComprehensiveTest}
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Comprehensive Test
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {/* Validation Report */}
        {validationReport && (
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Validation Report</h3>
              <Badge variant="outline">
                Test ID: {validationReport.testId}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {validationReport.passedTests}
                  </div>
                  <div className="text-sm text-muted-foreground">Tests Passed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {validationReport.failedTests}
                  </div>
                  <div className="text-sm text-muted-foreground">Tests Failed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {((validationReport.passedTests / validationReport.totalTests) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Detailed Results</h4>
              {validationReport.results.map((result, index) => (
                <Alert key={index} className="p-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.success)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.field}</span>
                        <Badge className={getStatusColor(result.success)}>
                          {result.operation}
                        </Badge>
                      </div>
                      <AlertDescription className="mb-2">
                        {result.message}
                      </AlertDescription>
                      {result.details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Test Logs */}
        {testLogs.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Phase 2 Execution Logs
            </h3>
            <Textarea
              value={testLogs.join('\n')}
              readOnly
              className="font-mono text-sm h-40"
            />
          </div>
        )}

        {/* Phase 2 Objectives */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Phase 2 Objectives:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Service Method Verification: Test updateRecurringTask with preferred staff updates</li>
            <li>• Data Transformation Validation: Verify preferredStaffId → preferred_staff_id mapping</li>
            <li>• Enhanced Debugging: Add request/response logging and field-specific tracking</li>
            <li>• Error Handling Improvement: Enhanced error messages and validation</li>
            <li>• Post-Update Verification: Confirm database persistence with verification queries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default Phase2TestingPanel;
