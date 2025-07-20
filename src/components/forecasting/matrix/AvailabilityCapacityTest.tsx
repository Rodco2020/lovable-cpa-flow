
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { EnhancedAvailabilityService } from '@/services/availability/enhancedAvailabilityService';
import { AvailabilityBasedCapacityService } from '@/services/forecasting/capacity/availabilityBasedCapacityService';

interface TestResult {
  staffId: string;
  staffName: string;
  weeklyHours: number;
  monthlyHours: number;
  availabilitySlots: number;
  status: 'success' | 'warning' | 'error';
  issues: string[];
}

/**
 * Availability Capacity Test Component
 * Tests the new availability-based capacity calculation system
 */
export const AvailabilityCapacityTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{
    totalStaff: number;
    totalWeeklyCapacity: number;
    totalMonthlyCapacity: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  } | null>(null);

  const runCapacityTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    setSummary(null);

    try {
      console.log('🧪 [CAPACITY TEST] Starting availability-based capacity test...');

      const availabilityService = new EnhancedAvailabilityService();
      const capacityService = new AvailabilityBasedCapacityService();

      // Get all staff capacities
      const staffCapacities = await availabilityService.getAllStaffCapacities();
      
      const results: TestResult[] = [];
      let totalWeeklyCapacity = 0;
      let totalMonthlyCapacity = 0;

      // Test each staff member
      for (const [staffId, capacitySummary] of Object.entries(staffCapacities)) {
        const issues: string[] = [];
        let status: 'success' | 'warning' | 'error' = 'success';

        // Calculate monthly capacity
        const monthStart = new Date();
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const monthlyCapacity = availabilityService.calculateMonthlyCapacity(
          capacitySummary.weeklyHours,
          monthStart,
          monthEnd
        );

        // Validate capacity
        if (capacitySummary.weeklyHours <= 0) {
          issues.push('Zero weekly capacity');
          status = 'error';
        } else if (capacitySummary.weeklyHours < 10) {
          issues.push('Very low weekly capacity');
          status = 'warning';
        } else if (capacitySummary.weeklyHours > 60) {
          issues.push('Unusually high weekly capacity');
          status = 'warning';
        }

        const availabilitySlots = capacitySummary.dailyBreakdown
          .reduce((total, day) => total + day.timeSlots.length, 0);

        if (availabilitySlots === 0) {
          issues.push('No availability slots found');
          status = 'error';
        }

        totalWeeklyCapacity += capacitySummary.weeklyHours;
        totalMonthlyCapacity += monthlyCapacity;

        results.push({
          staffId,
          staffName: `Staff-${staffId.slice(0, 8)}`, // Truncated for display
          weeklyHours: capacitySummary.weeklyHours,
          monthlyHours: monthlyCapacity,
          availabilitySlots,
          status,
          issues
        });
      }

      setTestResults(results);
      setSummary({
        totalStaff: results.length,
        totalWeeklyCapacity,
        totalMonthlyCapacity,
        successCount: results.filter(r => r.status === 'success').length,
        warningCount: results.filter(r => r.status === 'warning').length,
        errorCount: results.filter(r => r.status === 'error').length
      });

      console.log('✅ [CAPACITY TEST] Test completed:', {
        staffTested: results.length,
        totalWeeklyCapacity,
        totalMonthlyCapacity
      });

    } catch (error) {
      console.error('❌ [CAPACITY TEST] Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test on component mount
    runCapacityTest();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Availability-Based Capacity Test
            <Button
              onClick={runCapacityTest}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Testing...' : 'Run Test'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalStaff}</div>
                <div className="text-sm text-muted-foreground">Staff Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalWeeklyCapacity.toFixed(0)}h</div>
                <div className="text-sm text-muted-foreground">Weekly Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.totalMonthlyCapacity.toFixed(0)}h</div>
                <div className="text-sm text-muted-foreground">Monthly Capacity</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {summary.successCount} ✓
                  </Badge>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    {summary.warningCount} ⚠
                  </Badge>
                  <Badge variant="default" className="bg-red-100 text-red-800">
                    {summary.errorCount} ✗
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">Results</div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Testing availability-based capacity calculation...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.staffId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{result.status.toUpperCase()}</span>
                    </Badge>
                    <div>
                      <div className="font-medium">{result.staffName}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.availabilitySlots} availability slots
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{result.weeklyHours.toFixed(1)}h/week</div>
                    <div className="text-sm text-muted-foreground">
                      {result.monthlyHours.toFixed(1)}h/month
                    </div>
                  </div>
                  {result.issues.length > 0 && (
                    <div className="text-xs text-red-600">
                      {result.issues.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
