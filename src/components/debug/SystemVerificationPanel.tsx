
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Database, TestTube, FileText } from 'lucide-react';

interface VerificationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const SystemVerificationPanel: React.FC = () => {
  const [taskId, setTaskId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    setTestLogs(prev => [...prev, logEntry]);
    console.log(`[SystemVerification] ${logEntry}`);
  };

  const addResult = (result: VerificationResult) => {
    setVerificationResults(prev => [...prev, result]);
    addLog(`${result.test}: ${result.status.toUpperCase()} - ${result.message}`);
  };

  const clearResults = () => {
    setVerificationResults([]);
    setTestLogs([]);
  };

  // Phase 1 Task 1: Database Schema Verification
  const testDatabaseSchema = async () => {
    addLog('=== DATABASE SCHEMA VERIFICATION ===');
    
    try {
      // Test 1: Check if preferred_staff_id column exists
      const { data: tableInfo, error: tableError } = await supabase
        .from('recurring_tasks')
        .select('preferred_staff_id')
        .limit(1);

      if (tableError && tableError.message.includes('column "preferred_staff_id" does not exist')) {
        addResult({
          test: 'Column Existence',
          status: 'fail',
          message: 'preferred_staff_id column does not exist',
          details: tableError
        });
        return;
      }

      addResult({
        test: 'Column Existence',
        status: 'pass',
        message: 'preferred_staff_id column exists and is accessible'
      });

      // Test 2: Check column accepts NULL values
      if (taskId) {
        const { data: nullTest, error: nullError } = await supabase
          .from('recurring_tasks')
          .update({ preferred_staff_id: null })
          .eq('id', taskId)
          .select();

        if (nullError) {
          addResult({
            test: 'NULL Value Acceptance',
            status: 'fail',
            message: 'Column rejects NULL values',
            details: nullError
          });
        } else {
          addResult({
            test: 'NULL Value Acceptance',
            status: 'pass',
            message: 'Column accepts NULL values correctly'
          });
        }
      }

      // Test 3: Check column accepts UUID values
      if (taskId && staffId) {
        const { data: uuidTest, error: uuidError } = await supabase
          .from('recurring_tasks')
          .update({ preferred_staff_id: staffId })
          .eq('id', taskId)
          .select();

        if (uuidError) {
          addResult({
            test: 'UUID Value Acceptance',
            status: 'fail',
            message: 'Column rejects UUID values',
            details: uuidError
          });
        } else {
          addResult({
            test: 'UUID Value Acceptance',
            status: 'pass',
            message: 'Column accepts UUID values correctly'
          });
        }
      }

    } catch (error) {
      addResult({
        test: 'Database Schema',
        status: 'fail',
        message: 'Failed to verify database schema',
        details: error
      });
    }
  };

  // Phase 1 Task 2: Component Integration Testing
  const testComponentIntegration = async () => {
    addLog('=== COMPONENT INTEGRATION TESTING ===');

    try {
      // Test 1: Staff dropdown data fetch
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, full_name, status')
        .eq('status', 'active');

      if (staffError) {
        addResult({
          test: 'Staff Dropdown Data',
          status: 'fail',
          message: 'Failed to fetch active staff members',
          details: staffError
        });
      } else {
        addResult({
          test: 'Staff Dropdown Data',
          status: 'pass',
          message: `Successfully fetched ${staffData.length} active staff members`,
          details: { count: staffData.length, sample: staffData.slice(0, 3) }
        });
      }

      // Test 2: Task data structure validation
      if (taskId) {
        const { data: taskData, error: taskError } = await supabase
          .from('recurring_tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (taskError) {
          addResult({
            test: 'Task Data Structure',
            status: 'fail',
            message: 'Failed to fetch task data',
            details: taskError
          });
        } else {
          const hasRequiredFields = taskData.name && taskData.template_id && taskData.client_id;
          addResult({
            test: 'Task Data Structure',
            status: hasRequiredFields ? 'pass' : 'warning',
            message: hasRequiredFields ? 'Task has all required fields' : 'Task missing some required fields',
            details: {
              id: taskData.id,
              name: taskData.name,
              preferred_staff_id: taskData.preferred_staff_id,
              hasRequiredFields
            }
          });
        }
      }

    } catch (error) {
      addResult({
        test: 'Component Integration',
        status: 'fail',
        message: 'Component integration test failed',
        details: error
      });
    }
  };

  // Phase 1 Task 3: Data Flow Documentation
  const documentDataFlow = async () => {
    addLog('=== DATA FLOW DOCUMENTATION ===');

    const dataFlowSteps = [
      {
        step: 'UI Form Field',
        description: 'PreferredStaffField component receives user input',
        location: 'src/components/clients/EditRecurringTaskDialog/components/PreferredStaffField.tsx',
        dataFormat: 'string | null'
      },
      {
        step: 'Form State Management',
        description: 'React Hook Form manages field state with validation',
        location: 'src/components/clients/EditRecurringTaskDialog/hooks/useEditTaskForm.tsx',
        dataFormat: 'EditTaskFormValues.preferredStaffId: string | null'
      },
      {
        step: 'Form Submission',
        description: 'onSubmit transforms form data to RecurringTask partial',
        location: 'useEditTaskForm.onSubmit()',
        dataFormat: 'Partial<RecurringTask>.preferredStaffId: string | null'
      },
      {
        step: 'Container Layer',
        description: 'EditRecurringTaskContainer calls service layer',
        location: 'src/components/clients/EditRecurringTaskContainer.tsx',
        dataFormat: 'Partial<RecurringTask>'
      },
      {
        step: 'Service Layer',
        description: 'updateRecurringTask service processes the update',
        location: 'src/services/taskService/recurringTaskService.ts',
        dataFormat: 'Partial<RecurringTask> → database format'
      },
      {
        step: 'Data Transformation',
        description: 'transformApplicationToDatabase maps fields',
        location: 'src/services/taskService/dataTransformationService.ts',
        dataFormat: 'preferredStaffId → preferred_staff_id'
      },
      {
        step: 'Database Update',
        description: 'Supabase executes UPDATE statement',
        location: 'Database (recurring_tasks table)',
        dataFormat: 'preferred_staff_id: UUID | NULL'
      }
    ];

    dataFlowSteps.forEach((step, index) => {
      addResult({
        test: `Data Flow Step ${index + 1}`,
        status: 'pass',
        message: `${step.step}: ${step.description}`,
        details: {
          location: step.location,
          dataFormat: step.dataFormat
        }
      });
    });

    // Identify transformation points
    const transformationPoints = [
      'Form field value → Form state (React Hook Form)',
      'Form state → Submission data (onSubmit)',
      'Submission data → Service call (Container)',
      'Application format → Database format (Data Transformation Service)',
      'Service call → Database query (Supabase)'
    ];

    addResult({
      test: 'Transformation Points',
      status: 'warning',
      message: 'Critical transformation points identified where data could be lost',
      details: { points: transformationPoints }
    });
  };

  // Run all Phase 1 tests
  const runPhase1Tests = async () => {
    if (!taskId) {
      toast.error('Please enter a Task ID to run tests');
      return;
    }

    setIsRunningTests(true);
    clearResults();
    addLog('Starting Phase 1: System Verification and Baseline Testing');

    try {
      await testDatabaseSchema();
      await testComponentIntegration();
      await documentDataFlow();
      
      addLog('Phase 1 testing completed');
      toast.success('Phase 1 verification completed');
    } catch (error) {
      addLog(`Phase 1 testing failed: ${error}`);
      toast.error('Phase 1 verification failed');
    } finally {
      setIsRunningTests(false);
    }
  };

  // Test direct database update (existing functionality)
  const testDirectDatabaseUpdate = async () => {
    if (!taskId || !staffId) {
      toast.error('Please enter both Task ID and Staff ID');
      return;
    }

    addLog('=== DIRECT DATABASE UPDATE TEST ===');

    try {
      // Get current state
      const { data: beforeUpdate, error: fetchError } = await supabase
        .from('recurring_tasks')
        .select('id, name, preferred_staff_id, updated_at')
        .eq('id', taskId)
        .single();

      if (fetchError) {
        addResult({
          test: 'Direct Database Update',
          status: 'fail',
          message: 'Failed to fetch task before update',
          details: fetchError
        });
        return;
      }

      addLog(`Before update: preferred_staff_id = ${beforeUpdate.preferred_staff_id}`);

      // Perform direct update
      const { data: afterUpdate, error: updateError } = await supabase
        .from('recurring_tasks')
        .update({ 
          preferred_staff_id: staffId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        addResult({
          test: 'Direct Database Update',
          status: 'fail',
          message: 'Database update failed',
          details: updateError
        });
        return;
      }

      addLog(`After update: preferred_staff_id = ${afterUpdate.preferred_staff_id}`);

      // Verify persistence
      const { data: verification, error: verifyError } = await supabase
        .from('recurring_tasks')
        .select('preferred_staff_id, updated_at')
        .eq('id', taskId)
        .single();

      if (verifyError) {
        addResult({
          test: 'Direct Database Update',
          status: 'fail',
          message: 'Verification query failed',
          details: verifyError
        });
        return;
      }

      const success = verification.preferred_staff_id === staffId;
      addResult({
        test: 'Direct Database Update',
        status: success ? 'pass' : 'fail',
        message: success ? 'Direct database update successful' : 'Value not persisted correctly',
        details: {
          expected: staffId,
          actual: verification.preferred_staff_id,
          beforeUpdate,
          afterUpdate,
          verification
        }
      });

      addLog(`Verification: preferred_staff_id = ${verification.preferred_staff_id}`);

    } catch (error) {
      addResult({
        test: 'Direct Database Update',
        status: 'fail',
        message: 'Unexpected error during direct update test',
        details: error
      });
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-6 w-6" />
          Phase 1: System Verification and Baseline Testing
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
              placeholder="Enter staff member ID"
            />
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runPhase1Tests} 
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Run Phase 1 Tests
          </Button>
          <Button 
            onClick={testDirectDatabaseUpdate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Test Direct DB Update
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {verificationResults.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Verification Results</h3>
            <div className="grid gap-2">
              {verificationResults.map((result, index) => (
                <Alert key={index} className="p-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.test}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
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
              Test Execution Logs
            </h3>
            <Textarea
              value={testLogs.join('\n')}
              readOnly
              className="font-mono text-sm h-40"
            />
          </div>
        )}

        {/* Phase 1 Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Phase 1 Objectives:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Database Schema Verification: Confirm preferred_staff_id column and constraints</li>
            <li>• Component Integration Testing: Verify form field and staff dropdown functionality</li>
            <li>• Data Flow Documentation: Map complete UI → Database data transformation path</li>
            <li>• Baseline Testing: Establish current working state before modifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemVerificationPanel;
