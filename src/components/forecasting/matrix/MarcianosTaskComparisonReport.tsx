
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, RefreshCw, TrendingUp, Users, Clock } from 'lucide-react';
import { FilterComparisonService, FilterComparisonResult } from '@/services/forecasting/demand/performance/filtering/filterComparisonService';
import { useDemandData } from '@/hooks/useDemandData';

export const MarcianosTaskComparisonReport: React.FC = () => {
  const [comparisonResult, setComparisonResult] = useState<FilterComparisonResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: demandData, isLoading } = useDemandData();

  const runComparison = async () => {
    if (!demandData) {
      setError('No demand data available for comparison');
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      console.log('🧪 [MARCIANO COMPARISON] Starting filter comparison test...');
      
      const result = await FilterComparisonService.compareFilterResults(
        demandData,
        'Marciano Urbaez',
        'Senior'
      );
      
      setComparisonResult(result);
      console.log('✅ [MARCIANO COMPARISON] Comparison completed successfully');
      
    } catch (err) {
      console.error('❌ [MARCIANO COMPARISON] Comparison failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run comparison when component mounts and data is available
    if (!isLoading && demandData && !comparisonResult && !isRunning) {
      runComparison();
    }
  }, [isLoading, demandData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading demand data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Marciano's Task Filter Comparison Report
        </CardTitle>
        <CardDescription>
          Comparing preferred staff filter vs Senior skill filter results for Marciano Urbaez
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control Section */}
          <div className="flex gap-2">
            <Button onClick={runComparison} disabled={isRunning}>
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Comparison...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Filter Comparison
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {comparisonResult && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="preferred-staff">Preferred Staff</TabsTrigger>
                <TabsTrigger value="skill-filter">Skill Filter</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Preferred Staff Tasks</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {comparisonResult.results.preferredStaffFilter.taskCount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparisonResult.results.preferredStaffFilter.totalHours} hours
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Senior Skill Tasks</p>
                          <p className="text-2xl font-bold text-green-600">
                            {comparisonResult.results.skillFilter.taskCount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparisonResult.results.skillFilter.totalHours} hours
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">Common Tasks</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {comparisonResult.comparison.commonTasks}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Overlap between filters
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Test Subject:</span>
                        <Badge variant="outline">{comparisonResult.testSubject}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Execution Time:</span>
                        <span className="text-sm">{comparisonResult.executionTime.toFixed(2)}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Difference:</span>
                        <Badge variant={comparisonResult.comparison.totalDifference === 0 ? "default" : "destructive"}>
                          {comparisonResult.comparison.totalDifference} tasks
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferred-staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Staff Filter Results</CardTitle>
                    <CardDescription>Tasks found when filtering by Marciano Urbaez</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparisonResult.results.preferredStaffFilter.matchedTasks.length === 0 ? (
                        <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No tasks found for Marciano Urbaez</p>
                        </div>
                      ) : (
                        comparisonResult.results.preferredStaffFilter.matchedTasks.map((task, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">{task.taskName}</h4>
                              <Badge variant="outline">{task.skillType}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Client: {task.clientName}</span>
                              <span>Hours: {task.hours}</span>
                              <span>Month: {task.monthLabel}</span>
                              <span>Staff: {task.preferredStaffName}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skill-filter" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Senior Skill Filter Results</CardTitle>
                    <CardDescription>Tasks found when filtering by Senior skill</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparisonResult.results.skillFilter.matchedTasks.length === 0 ? (
                        <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No Senior skill tasks found</p>
                        </div>
                      ) : (
                        comparisonResult.results.skillFilter.matchedTasks.map((task, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-green-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">{task.taskName}</h4>
                              <Badge variant="outline">{task.skillType}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Client: {task.clientName}</span>
                              <span>Hours: {task.hours}</span>
                              <span>Month: {task.monthLabel}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                    <CardDescription>Understanding why the filter results differ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {comparisonResult.comparison.uniqueToPreferredStaff}
                          </div>
                          <div className="text-sm text-muted-foreground">Unique to Preferred Staff</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {comparisonResult.comparison.uniqueToSkill}
                          </div>
                          <div className="text-sm text-muted-foreground">Unique to Skill Filter</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {comparisonResult.comparison.hoursDifference}
                          </div>
                          <div className="text-sm text-muted-foreground">Hours Difference</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Analysis Notes</h4>
                        <div className="space-y-2">
                          {comparisonResult.comparison.analysisNotes.map((note, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
