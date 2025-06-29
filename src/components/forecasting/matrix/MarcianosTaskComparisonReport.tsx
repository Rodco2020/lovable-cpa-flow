
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDemandMatrixData } from './hooks/useDemandMatrixData';
import { FilterComparisonService, FilterComparisonResult } from '@/services/forecasting/demand/performance/filtering/filterComparisonService';
import { Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Filter } from 'lucide-react';

export const MarcianosTaskComparisonReport: React.FC = () => {
  const { demandData, isLoading, error } = useDemandMatrixData('skill');
  const [comparisonResult, setComparisonResult] = useState<FilterComparisonResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const runComparison = async () => {
    if (!demandData) {
      setTestError('No demand data available');
      return;
    }

    setIsRunning(true);
    setTestError(null);
    
    try {
      console.log('🚀 [MARCIANO COMPARISON] Starting filter comparison test...');
      
      const result = await FilterComparisonService.compareFilterResults(
        demandData,
        'Marciano Urbaez',
        'Senior'
      );
      
      setComparisonResult(result);
      console.log('✅ [MARCIANO COMPARISON] Test completed successfully:', result);
      
    } catch (error) {
      console.error('❌ [MARCIANO COMPARISON] Test failed:', error);
      setTestError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const renderTaskTable = (tasks: any[], title: string, showPreferredStaff: boolean = false) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No tasks found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{task.taskName}</div>
                      <div className="text-xs text-muted-foreground">{task.clientName}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.skillType}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {task.hours} hours
                      {task.month && ` • ${task.monthLabel || task.month}`}
                    </span>
                    {showPreferredStaff && task.preferredStaffName && (
                      <Badge variant="secondary" className="text-xs">
                        {task.preferredStaffName}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!comparisonResult) return null;

    const { results, comparison } = comparisonResult;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Preferred Staff</div>
                <div className="text-2xl font-bold">{results.preferredStaffFilter.taskCount}</div>
                <div className="text-xs text-muted-foreground">
                  {results.preferredStaffFilter.totalHours} hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Senior Skill</div>
                <div className="text-2xl font-bold">{results.skillFilter.taskCount}</div>
                <div className="text-xs text-muted-foreground">
                  {results.skillFilter.totalHours} hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Common Tasks</div>
                <div className="text-2xl font-bold">{comparison.commonTasks}</div>
                <div className="text-xs text-muted-foreground">
                  Overlap between filters
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Hour Difference</div>
                <div className="text-2xl font-bold">{comparison.hoursDifference}</div>
                <div className="text-xs text-muted-foreground">
                  Absolute difference
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalysisNotes = () => {
    if (!comparisonResult?.comparison.analysisNotes.length) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Analysis Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {comparisonResult.comparison.analysisNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading demand data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load demand data: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Marciano's Filter Comparison Report</span>
          <Button 
            onClick={runComparison}
            disabled={isRunning || !demandData}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" />
                Run Comparison
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{testError}</AlertDescription>
          </Alert>
        )}

        {comparisonResult && (
          <div className="space-y-6">
            {/* Test Metadata */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{comparisonResult.testSubject}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {comparisonResult.executionTime.toFixed(2)}ms
                </span>
              </div>
            </div>

            <Separator />

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Analysis Notes */}
            {renderAnalysisNotes()}

            {/* Detailed Results */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks">Task Comparison</TabsTrigger>
                <TabsTrigger value="preferred">Preferred Staff Tasks</TabsTrigger>
                <TabsTrigger value="skill">Senior Skill Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    {renderTaskTable(
                      comparisonResult.results.preferredStaffFilter.matchedTasks,
                      `Marciano's Tasks (${comparisonResult.results.preferredStaffFilter.taskCount})`,
                      true
                    )}
                  </div>
                  <div>
                    {renderTaskTable(
                      comparisonResult.results.skillFilter.matchedTasks,
                      `Senior Skill Tasks (${comparisonResult.results.skillFilter.taskCount})`
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferred">
                {renderTaskTable(
                  comparisonResult.results.preferredStaffFilter.matchedTasks,
                  "All Preferred Staff Filter Results",
                  true
                )}
              </TabsContent>

              <TabsContent value="skill">
                {renderTaskTable(
                  comparisonResult.results.skillFilter.matchedTasks,
                  "All Senior Skill Filter Results"
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!comparisonResult && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Comparison" to analyze the difference between</p>
            <p>Marciano's preferred staff filter and the Senior skill filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
