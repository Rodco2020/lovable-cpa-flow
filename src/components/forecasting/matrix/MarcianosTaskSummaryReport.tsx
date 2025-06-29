
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, User, Calendar, Clock, FileText, RefreshCw } from 'lucide-react';
import { useDemandMatrixData } from '@/components/forecasting/matrix/hooks/useDemandMatrixData';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandFilters } from '@/types/demand';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';
import { StaffFilterValidationService } from '@/services/staff/staffFilterValidationService';

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
  const [marcianoUuid, setMarcianoUuid] = useState<string | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  // Use the hook with the correct parameter (grouping mode)
  const { demandData, isLoading, error } = useDemandMatrixData('skill');

  // Resolve Marciano's UUID on component mount
  useEffect(() => {
    const resolveMarciano = async () => {
      console.log('🔍 [MARCIANO REPORT] Resolving Marciano Urbaez UUID...');
      
      try {
        // Try different name variations
        const nameVariations = [
          'Marciano Urbaez',
          'Marciano',
          'Urbaez',
          'marciano urbaez',
          'marciano-urbaez'
        ];

        const resolvedUuids = await UuidResolutionService.resolveStaffNamesToUuids(nameVariations);
        
        if (resolvedUuids.length > 0) {
          setMarcianoUuid(resolvedUuids[0]);
          setResolutionError(null);
          console.log('✅ [MARCIANO REPORT] Successfully resolved Marciano UUID:', resolvedUuids[0]);
        } else {
          setResolutionError('Could not find Marciano Urbaez in the staff database');
          console.warn('⚠️ [MARCIANO REPORT] Could not resolve Marciano UUID');
        }
      } catch (error) {
        console.error('❌ [MARCIANO REPORT] Error resolving Marciano UUID:', error);
        setResolutionError(`Error resolving staff: ${error}`);
      }
    };

    resolveMarciano();
  }, []);

  // Create filters with resolved UUID
  const marcianoFilters: DemandFilters = useMemo(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const endDate = new Date(currentDate.getFullYear(), 11, 31);
    
    return {
      skills: [],
      clients: [],
      preferredStaff: marcianoUuid ? [marcianoUuid] : [], // Use resolved UUID instead of names
      timeHorizon: {
        start: startDate,
        end: endDate
      }
    };
  }, [marcianoUuid]);

  // Filter the demand data for Marciano's tasks
  const filteredMatrixData = useMemo(() => {
    if (!demandData || !marcianoUuid) return null;
    
    console.log('🔍 [MARCIANO REPORT] Filtering data with UUID:', marcianoUuid);
    return DemandPerformanceOptimizer.optimizeFiltering(demandData, marcianoFilters);
  }, [demandData, marcianoFilters, marcianoUuid]);

  const marcianoTasks: TaskSummary[] = useMemo(() => {
    if (!filteredMatrixData || !filteredMatrixData.dataPoints || !marcianoUuid) return [];
    
    console.log('🔍 [MARCIANO REPORT] Processing filtered data for tasks...');
    const tasks: TaskSummary[] = [];
    
    filteredMatrixData.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          // Now we're using UUID matching which should be more reliable
          if (task.preferredStaffId === marcianoUuid) {
            tasks.push({
              clientName: task.clientName,
              taskName: task.taskName,
              skillType: task.skillType,
              monthlyHours: task.monthlyHours,
              estimatedHours: task.estimatedHours,
              recurrencePattern: `${task.recurrencePattern.type} (${task.recurrencePattern.frequency}x)`,
              month: dataPoint.monthLabel
            });
            
            console.log('✅ [MARCIANO REPORT] Found matching task:', {
              taskName: task.taskName,
              client: task.clientName,
              staffId: task.preferredStaffId
            });
          }
        });
      }
    });
    
    console.log('✅ [MARCIANO REPORT] Task processing complete:', {
      totalTasks: tasks.length,
      totalHours: tasks.reduce((sum, task) => sum + task.monthlyHours, 0)
    });
    
    return tasks;
  }, [filteredMatrixData, marcianoUuid]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Validate our filtering approach
    if (marcianoUuid) {
      const validation = await StaffFilterValidationService.validateAndResolveStaffFilters([marcianoUuid]);
      console.log('🔍 [MARCIANO REPORT] Filter validation result:', validation);
    }
    
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

  if (error || resolutionError) {
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
            {resolutionError || `Failed to load Marciano's task data: ${error}`}
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
          {marcianoUuid && (
            <Badge variant="secondary" className="ml-2 text-xs">
              UUID: {marcianoUuid.substring(0, 8)}...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of all tasks assigned to Marciano Urbaez
          {marcianoUuid && (
            <div className="text-xs text-green-600 mt-1">
              ✅ Staff UUID resolved successfully
            </div>
          )}
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
                {marcianoUuid 
                  ? "Tasks may not be assigned to Marciano, or the data may be filtered out."
                  : "Could not resolve Marciano's staff UUID."
                }
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
                <RefreshCw className="h-4 w-4 mr-2" />
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
