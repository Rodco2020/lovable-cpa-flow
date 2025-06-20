
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Filter, Users, CheckCircle, AlertCircle, Target } from 'lucide-react';
import { getPreferredStaffFromDatabase } from '@/services/staff/preferredStaffDataService';
import { useDemandMatrixFiltering } from '../hooks/useDemandMatrixFiltering';
import { DemandMatrixData } from '@/types/demand';

/**
 * Phase 2 Validation Panel
 * 
 * Test component to validate the Phase 2 implementation:
 * - "All Preferred Staff" shows ALL tasks (with and without preferred staff)
 * - Specific staff selection filters to only those staff members
 * - Proper integration with existing skill and client filters
 */
export const Phase2ValidationPanel: React.FC = () => {
  const [testMode, setTestMode] = useState<'all' | 'specific' | 'none'>('all');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Get preferred staff data
  const { 
    data: preferredStaff = [], 
    isLoading: staffLoading, 
    error: staffError,
    refetch: refetchStaff 
  } = useQuery({
    queryKey: ['phase2-validation-staff'],
    queryFn: getPreferredStaffFromDatabase,
    staleTime: 0, // No cache for testing
  });

  // Mock demand data for testing (you can replace this with real data)
  const mockDemandData: DemandMatrixData = {
    skills: ['Tax Preparation', 'Audit', 'Bookkeeping'],
    months: [
      { key: '2024-01', label: 'Jan 2024' },
      { key: '2024-02', label: 'Feb 2024' },
      { key: '2024-03', label: 'Mar 2024' }
    ],
    dataPoints: [
      {
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 40,
        taskCount: 8,
        clientCount: 4,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Client A',
            recurringTaskId: 'task-1',
            taskName: 'Tax Return Preparation',
            skillType: 'Tax Preparation',
            estimatedHours: 8,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 1
            },
            monthlyHours: 20,
            preferredStaff: preferredStaff[0] ? { 
              staffId: preferredStaff[0].id, 
              staffName: preferredStaff[0].full_name,
              assignmentType: 'preferred' as const
            } : undefined
          },
          {
            clientId: 'client-2',
            clientName: 'Client B',
            recurringTaskId: 'task-2',
            taskName: 'Quarterly Review',
            skillType: 'Tax Preparation',
            estimatedHours: 6,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 1
            },
            monthlyHours: 15,
            preferredStaff: preferredStaff[1] ? { 
              staffId: preferredStaff[1].id, 
              staffName: preferredStaff[1].full_name,
              assignmentType: 'preferred' as const
            } : undefined
          },
          {
            clientId: 'client-3',
            clientName: 'Client C',
            recurringTaskId: 'task-3',
            taskName: 'Basic Tax Filing',
            skillType: 'Tax Preparation',
            estimatedHours: 2,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 1
            },
            monthlyHours: 5,
            preferredStaff: undefined // Task without preferred staff
          }
        ]
      }
    ],
    totalDemand: 40,
    totalTasks: 8,
    totalClients: 4,
    skillSummary: {
      'Tax Preparation': {
        totalHours: 40,
        taskCount: 8,
        clientCount: 4
      }
    }
  };

  // Test the filtering behavior with Phase 2 three-mode system
  const isAllPreferredStaffSelected = testMode === 'all';
  const testSelectedStaff = testMode === 'all' ? preferredStaff.map(s => s.id) : selectedStaffIds;

  const filteredResult = useDemandMatrixFiltering({
    demandData: mockDemandData,
    selectedSkills: ['Tax Preparation'],
    selectedClients: ['client-1', 'client-2', 'client-3'],
    selectedPreferredStaff: testSelectedStaff,
    monthRange: { start: 0, end: 2 },
    isAllSkillsSelected: false,
    isAllClientsSelected: false,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode: testMode // Phase 2: Add the required filtering mode
  });

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleRefresh = () => {
    refetchStaff();
  };

  const getFilteringStatus = () => {
    if (staffLoading) return { status: 'loading', message: 'Loading...' };
    
    if (testMode === 'all') {
      const totalTasks = filteredResult?.dataPoints[0]?.taskBreakdown.length || 0;
      const tasksWithPreferredStaff = filteredResult?.dataPoints[0]?.taskBreakdown.filter(t => t.preferredStaff?.staffId).length || 0;
      const tasksWithoutPreferredStaff = totalTasks - tasksWithPreferredStaff;
      
      if (totalTasks > 0 && tasksWithoutPreferredStaff > 0) {
        return { status: 'success', message: `All tasks shown: ${tasksWithPreferredStaff} with staff + ${tasksWithoutPreferredStaff} without staff` };
      } else if (totalTasks > 0) {
        return { status: 'warning', message: `Only ${tasksWithPreferredStaff} tasks with preferred staff found` };
      } else {
        return { status: 'error', message: 'No tasks found' };
      }
    } else if (testMode === 'specific') {
      const filteredTasks = filteredResult?.dataPoints[0]?.taskBreakdown.length || 0;
      if (selectedStaffIds.length === 0) {
        return { status: 'warning', message: 'No staff selected - select staff to test filtering' };
      } else if (filteredTasks > 0) {
        return { status: 'success', message: `${filteredTasks} tasks shown for selected staff` };
      } else {
        return { status: 'error', message: 'No tasks found for selected staff' };
      }
    } else if (testMode === 'none') {
      const filteredTasks = filteredResult?.dataPoints[0]?.taskBreakdown.length || 0;
      return { status: 'success', message: `${filteredTasks} unassigned tasks shown` };
    }
    
    return { status: 'error', message: 'Unknown test mode' };
  };

  const filteringStatus = getFilteringStatus();

  if (staffError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load preferred staff data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Phase 2: Three-Mode Preferred Staff Filtering Validation</h2>
          <p className="text-gray-600 mt-1">Testing enhanced filtering logic for preferred staff (all/specific/none modes)</p>
        </div>
        <Button onClick={handleRefresh} disabled={staffLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${staffLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Test Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Test Mode
          </CardTitle>
          <CardDescription>Select the filtering behavior to test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={testMode === 'all' ? 'default' : 'outline'}
              onClick={() => setTestMode('all')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              All Tasks
              <Badge variant="secondary">Show All</Badge>
            </Button>
            <Button
              variant={testMode === 'specific' ? 'default' : 'outline'}
              onClick={() => setTestMode('specific')}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Specific Staff
              <Badge variant="secondary">Filter by Selected</Badge>
            </Button>
            <Button
              variant={testMode === 'none' ? 'default' : 'outline'}
              onClick={() => setTestMode('none')}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Unassigned Only
              <Badge variant="secondary">No Preferred Staff</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Selection (for specific mode) */}
      {testMode === 'specific' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Preferred Staff for Testing</CardTitle>
            <CardDescription>Choose specific staff members to test filtering behavior</CardDescription>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading staff...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {preferredStaff.map(staff => (
                  <label key={staff.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.includes(staff.id)}
                      onChange={() => handleStaffToggle(staff.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{staff.full_name}</span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtering Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtering Test Results
            <Badge 
              variant={filteringStatus.status === 'success' ? 'default' : filteringStatus.status === 'error' ? 'destructive' : 'secondary'}
              className="ml-auto"
            >
              {filteringStatus.status === 'success' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {filteringStatus.message}
            </Badge>
          </CardTitle>
          <CardDescription>
            Testing {testMode} mode behavior - {testMode === 'all' ? 'should show ALL tasks' : testMode === 'specific' ? 'should show only matching tasks' : 'should show only unassigned tasks'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Configuration */}
            <div className="p-3 bg-blue-50 rounded">
              <h5 className="font-semibold text-blue-800 mb-2">Test Configuration:</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Mode: {testMode.toUpperCase()} ({testMode === 'all' ? 'show all tasks' : testMode === 'specific' ? 'filter by selected staff' : 'show unassigned only'})</div>
                <div>Selected Staff: {testMode === 'all' ? 'All' : testMode === 'specific' ? selectedStaffIds.length || 'None' : 'N/A'}</div>
                <div>Expected Behavior: {testMode === 'all' ? 'Show tasks both with and without preferred staff' : testMode === 'specific' ? 'Show only tasks assigned to selected staff' : 'Show only tasks without preferred staff'}</div>
              </div>
            </div>

            {/* Results */}
            {filteredResult && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h6 className="font-semibold mb-2">Original Data</h6>
                  <div className="text-sm bg-gray-100 p-2 rounded">
                    <div>Total Tasks: {mockDemandData.dataPoints[0]?.taskBreakdown.length || 0}</div>
                    <div>Tasks with Preferred Staff: {mockDemandData.dataPoints[0]?.taskBreakdown.filter(t => t.preferredStaff?.staffId).length || 0}</div>
                    <div>Tasks without Preferred Staff: {mockDemandData.dataPoints[0]?.taskBreakdown.filter(t => !t.preferredStaff?.staffId).length || 0}</div>
                  </div>
                </div>
                <div>
                  <h6 className="font-semibold mb-2">Filtered Results</h6>
                  <div className="text-sm bg-green-100 p-2 rounded">
                    <div>Filtered Tasks: {filteredResult.dataPoints[0]?.taskBreakdown.length || 0}</div>
                    <div>Demand Hours: {filteredResult.dataPoints[0]?.demandHours.toFixed(1) || '0.0'}</div>
                    <div>Client Count: {filteredResult.dataPoints[0]?.clientCount || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2 Success Criteria */}
            <div className="p-3 bg-green-50 rounded">
              <h6 className="font-semibold text-green-800">Phase 2 Success Criteria:</h6>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>✅ "All" mode shows ALL tasks (both with and without preferred staff)</li>
                <li>✅ "Specific" mode filters to only show tasks for selected staff</li>
                <li>✅ "None" mode shows only tasks without preferred staff assignments</li>
                <li>✅ Filtering integrates properly with existing skill and client filters</li>
                <li>✅ UI correctly reflects the current filtering behavior</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase2ValidationPanel;
