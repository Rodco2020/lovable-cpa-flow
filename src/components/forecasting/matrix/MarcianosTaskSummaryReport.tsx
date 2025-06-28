
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, User, Calendar, Clock, FileText } from 'lucide-react';
import { useDemandMatrixData } from '@/components/forecasting/matrix/hooks/useDemandMatrixData';
import { DemandFilters } from '@/types/demand';

interface TaskSummary {
  clientName: string;
  taskName: string;
  skillType: string;
  monthlyHours: number;
  estimatedHours: number;
  recurrencePattern: string;
  month: string;
}

export const MarcianosTaskSummaryReport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Create filters specifically for Marciano Urbaez
  const marcianoFilters: DemandFilters = useMemo(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const endDate = new Date(currentDate.getFullYear(), 11, 31);
    
    return {
      skills: [],
      clients: [],
      preferredStaff: ['marciano-urbaez', 'Marciano Urbaez'], // Try both variations
      timeHorizon: {
        start: startDate,
        end: endDate
      }
    };
  }, []);

  const { data: matrixData, isLoading, error } = useDemandMatrixData(marcianoFilters);

  const marcianoTasks: TaskSummary[] = useMemo(() => {
    if (!matrixData || !matrixData.dataPoints) return [];
    
    const tasks: TaskSummary[] = [];
    
    matrixData.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (task.preferredStaffId || task.preferredStaffName) {
            const staffId = task.preferredStaffId?.toLowerCase();
            const staffName = task.preferredStaffName?.toLowerCase();
            
            if (staffId?.includes('marciano') || staffName?.includes('marciano')) {
              tasks.push({
                clientName: task.clientName,
                taskName: task.taskName,
                skillType: task.skillType,
                monthlyHours: task.monthlyHours,
                estimatedHours: task.estimatedHours,
                recurrencePattern: `${task.recurrencePattern.type} (${task.recurrencePattern.frequency}x)`,
                month: dataPoint.monthLabel
              });
            }
          }
        });
      }
    });
    
    return tasks;
  }, [matrixData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  const totalHours = useMemo(() => {
    return marcianoTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
  }, [marcianoTasks]);

  const uniqueClients = useMemo(() => {
    return new Set(marcianoTasks.map(task => task.clientName)).size;
  }, [marcianoTasks]);

  const skillDistribution = useMemo(() => {
    const distribution = marcianoTasks.reduce((acc, task) => {
      acc[task.skillType] = (acc[task.skillType] || 0) + task.monthlyHours;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([skill, hours]) => ({ skill, hours }));
  }, [marcianoTasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Marciano's Task Summary Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Marciano's task data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Failed to load Marciano's task data. Please try again.
          </p>
          <Button onClick={handleGenerateReport} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Marciano's Task Summary Report
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of all tasks assigned to Marciano Urbaez
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Tasks</p>
                  <p className="text-2xl font-bold">{marcianoTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Total Hours</p>
                  <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Unique Clients</p>
                  <p className="text-2xl font-bold">{uniqueClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skill Distribution */}
        {skillDistribution.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Skill Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {skillDistribution.map(({ skill, hours }) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1">
                  {skill}: {hours.toFixed(1)}h
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Task Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Task Details</h3>
          {marcianoTasks.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No tasks found for Marciano Urbaez</p>
              <p className="text-sm text-gray-500 mt-1">
                This could mean no tasks are assigned to Marciano, or the staff ID doesn't match exactly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {marcianoTasks.map((task, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">{task.taskName}</h4>
                        <p className="text-sm text-muted-foreground">{task.clientName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.skillType}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {task.recurrencePattern}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <p><span className="font-medium">Month:</span> {task.month}</p>
                          <p><span className="font-medium">Monthly Hours:</span> {task.monthlyHours.toFixed(1)}</p>
                          <p><span className="font-medium">Estimated Hours:</span> {task.estimatedHours.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Generate Report Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {reportGenerated ? 'Regenerate Report' : 'Generate Detailed Report'}
              </>
            )}
          </Button>
          
          {reportGenerated && (
            <p className="text-sm text-green-600 text-center mt-2">
              Report generated successfully! Data is displayed above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
