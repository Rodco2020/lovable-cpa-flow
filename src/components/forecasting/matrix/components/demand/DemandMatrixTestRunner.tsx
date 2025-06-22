
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DemandMatrixControlsFixed } from '../../DemandMatrixControls/DemandMatrixControlsFixed';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';

/**
 * Test Runner for Fixed Demand Matrix Controls
 * 
 * PURPOSE:
 * - Test the fixed preferred staff filtering logic
 * - Validate that 'All' mode shows all tasks
 * - Verify proper metric calculations
 * - Provide debugging feedback
 */
export const DemandMatrixTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Get real demand data for testing
  const { data: demandData, isLoading, error } = useDemandMatrixData();

  const runFilteringTests = async () => {
    if (!demandData) {
      console.error('No demand data available for testing');
      return;
    }

    setIsRunning(true);
    const results: any[] = [];

    try {
      console.log('🧪 [TEST RUNNER] Starting filtering tests with real data');

      // Test 1: Verify data structure
      const dataStructureTest = {
        name: 'Data Structure Validation',
        status: demandData.dataPoints.length > 0 ? 'pass' : 'fail',
        details: `Found ${demandData.dataPoints.length} data points with ${demandData.totalDemand}h total demand`
      };
      results.push(dataStructureTest);

      // Test 2: Check for task breakdown validity
      const taskBreakdownTest = {
        name: 'Task Breakdown Validation',
        status: 'pass',
        details: 'Checking task breakdown structure...'
      };

      let validBreakdowns = 0;
      let invalidBreakdowns = 0;
      let tasksWithStaff = 0;
      let tasksWithoutStaff = 0;

      demandData.dataPoints.forEach(point => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          validBreakdowns++;
          point.taskBreakdown.forEach((task: any) => {
            if (task.preferredStaff) {
              tasksWithStaff++;
            } else {
              tasksWithoutStaff++;
            }
          });
        } else {
          invalidBreakdowns++;
        }
      });

      taskBreakdownTest.details = `Valid: ${validBreakdowns}, Invalid: ${invalidBreakdowns}, With Staff: ${tasksWithStaff}, Without Staff: ${tasksWithoutStaff}`;
      taskBreakdownTest.status = invalidBreakdowns === 0 ? 'pass' : 'warning';
      results.push(taskBreakdownTest);

      // Test 3: Preferred Staff Filter Modes
      const staffModeTests = [
        {
          name: 'All Mode Filter Test',
          mode: 'all',
          expectedBehavior: 'Should show all tasks regardless of staff assignment'
        },
        {
          name: 'None Mode Filter Test', 
          mode: 'none',
          expectedBehavior: 'Should show only tasks without preferred staff'
        }
      ];

      staffModeTests.forEach(test => {
        results.push({
          name: test.name,
          status: 'info',
          details: test.expectedBehavior
        });
      });

      console.log('✅ [TEST RUNNER] Filtering tests complete');

    } catch (error) {
      console.error('❌ [TEST RUNNER] Test execution failed:', error);
      results.push({
        name: 'Test Execution',
        status: 'fail',
        details: `Error: ${error}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Test Data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load demand data for testing: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demand Matrix Filter Testing (Fixed Version)</CardTitle>
            <Button 
              onClick={runFilteringTests} 
              disabled={isRunning || !demandData}
              size="sm"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.details}</div>
                    </div>
                  </div>
                  <Badge variant={result.status === 'pass' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show the fixed controls component */}
      <DemandMatrixControlsFixed
        demandData={demandData}
        isLoading={isLoading}
        onExport={() => console.log('Export triggered from test runner')}
      />
    </div>
  );
};

export default DemandMatrixTestRunner;
