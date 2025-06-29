
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDemandMatrix } from './hooks/useDemandMatrix';

export interface StaffComparisonData {
  staffId: string;
  staffName: string;
  staffData: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    dataPoints: any[];
    months: any[];
    skills: string[];
    skillSummary: Record<string, any>;
    clientTotals: Map<string, number>;
  };
  seniorData: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    dataPoints: any[];
    months: any[];
    skills: string[];
    skillSummary: Record<string, any>;
    clientTotals: Map<string, number>;
  };
  comparison: {
    hoursDifference: number;
    tasksDifference: number;
    clientsDifference: number;
    matchPercentage: number;
  };
}

export interface MultiStaffComparisonService {
  compareMultipleStaff: (staffIds: string[]) => Promise<StaffComparisonData[]>;
}

// Mock implementation for now
const mockMultiStaffComparisonService: MultiStaffComparisonService = {
  compareMultipleStaff: async (staffIds: string[]): Promise<StaffComparisonData[]> => {
    return staffIds.map(staffId => ({
      staffId,
      staffName: `Staff ${staffId}`,
      staffData: {
        totalHours: 120,
        taskCount: 15,
        clientCount: 8,
        totalDemand: 120,
        totalTasks: 15,
        totalClients: 8,
        dataPoints: [],
        months: [],
        skills: [],
        skillSummary: {},
        clientTotals: new Map()
      },
      seniorData: {
        totalHours: 100,
        taskCount: 12,
        clientCount: 6,
        totalDemand: 100,
        totalTasks: 12,
        totalClients: 6,
        dataPoints: [],
        months: [],
        skills: [],
        skillSummary: {},
        clientTotals: new Map()
      },
      comparison: {
        hoursDifference: 20,
        tasksDifference: 3,
        clientsDifference: 2,
        matchPercentage: 83.3
      }
    }));
  }
};

export const MultiStaffComparisonReport: React.FC = () => {
  const [comparisonData, setComparisonData] = useState<StaffComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaffIds] = useState<string[]>(['staff-1', 'staff-2', 'staff-3']);

  const { matrixData, error: matrixError, isLoading: matrixLoading } = useDemandMatrix();

  useEffect(() => {
    if (selectedStaffIds.length > 0) {
      loadComparisonData();
    }
  }, [selectedStaffIds]);

  const loadComparisonData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await mockMultiStaffComparisonService.compareMultipleStaff(selectedStaffIds);
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStaffComparison = (staffData: StaffComparisonData) => (
    <Card key={staffData.staffId} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{staffData.staffName}</CardTitle>
          <Badge variant="outline">
            {staffData.comparison.matchPercentage.toFixed(1)}% Match
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Staff Filter Results</h4>
            <div className="space-y-1 text-sm">
              <div>Hours: {staffData.staffData.totalHours}</div>
              <div>Tasks: {staffData.staffData.taskCount}</div>
              <div>Clients: {staffData.staffData.clientCount}</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Senior Skill Filter</h4>
            <div className="space-y-1 text-sm">
              <div>Hours: {staffData.seniorData.totalHours}</div>
              <div>Tasks: {staffData.seniorData.taskCount}</div>
              <div>Clients: {staffData.seniorData.clientCount}</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h4 className="font-semibold mb-2">Comparison</h4>
          <div className="space-y-1 text-sm">
            <div>Hours Difference: {staffData.comparison.hoursDifference}</div>
            <div>Tasks Difference: {staffData.comparison.tasksDifference}</div>
            <div>Clients Difference: {staffData.comparison.clientsDifference}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (matrixLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading matrix data...</div>
        </CardContent>
      </Card>
    );
  }

  if (matrixError) {
    return (
      <Alert>
        <AlertDescription>
          Error loading matrix data: {matrixError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multi-Staff Comparison Report</h2>
          <p className="text-muted-foreground">
            Compare preferred staff filters with Senior skill filter across multiple staff members
          </p>
        </div>
        <Button onClick={loadComparisonData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Individual Comparisons</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4">
          {comparisonData.map(renderStaffComparison)}
        </TabsContent>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {comparisonData.reduce((sum, data) => sum + data.comparison.matchPercentage, 0) / comparisonData.length || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Match</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{comparisonData.length}</div>
                  <div className="text-sm text-muted-foreground">Staff Compared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {comparisonData.reduce((sum, data) => sum + data.staffData.totalHours, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
