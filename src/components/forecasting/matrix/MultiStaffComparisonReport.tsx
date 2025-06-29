
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDemandMatrixData } from './hooks/useDemandMatrixData';
import { MultiStaffComparisonService, MultiStaffComparisonResult } from '@/services/forecasting/demand/performance/filtering/multiStaffComparisonService';
import { Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Filter, BarChart3 } from 'lucide-react';

export const MultiStaffComparisonReport: React.FC = () => {
  const { demandData, isLoading, error } = useDemandMatrixData('skill');
  const [comparisonResult, setComparisonResult] = useState<MultiStaffComparisonResult | null>(null);
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
      console.log('🚀 [MULTI-STAFF COMPARISON] Starting multi-staff comparison test...');
      
      const result = await MultiStaffComparisonService.compareMultipleStaff(
        demandData,
        ['Marciano Urbaez', 'Maria Vargas', 'Luis Rodriguez'],
        'Senior'
      );
      
      setComparisonResult(result);
      console.log('✅ [MULTI-STAFF COMPARISON] Test completed successfully:', result);
      
    } catch (error) {
      console.error('❌ [MULTI-STAFF COMPARISON] Test failed:', error);
      setTestError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const renderAggregatedMetrics = () => {
    if (!comparisonResult) return null;

    const { aggregatedMetrics } = comparisonResult;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Total Staff Tasks</div>
                <div className="text-2xl font-bold">{aggregatedMetrics.totalPreferredStaffTasks}</div>
                <div className="text-xs text-muted-foreground">
                  {aggregatedMetrics.totalPreferredStaffHours} hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Senior Skill Tasks</div>
                <div className="text-2xl font-bold">{aggregatedMetrics.totalSkillTasks}</div>
                <div className="text-xs text-muted-foreground">
                  {aggregatedMetrics.totalSkillHours} hours
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
                <div className="text-sm font-medium">Avg Common Tasks</div>
                <div className="text-2xl font-bold">{aggregatedMetrics.averageCommonTasks}</div>
                <div className="text-xs text-muted-foreground">
                  Per staff member
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Most Active</div>
                <div className="text-lg font-bold">{aggregatedMetrics.staffWithMostTasks}</div>
                <div className="text-xs text-muted-foreground">
                  Staff with most tasks
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStaffComparison = (staffComparison: MultiStaffComparisonResult['staffComparisons'][0]) => {
    const { staffName, result } = staffComparison;

    if (staffComparison.staffUuid === 'error') {
      return (
        <Card key={staffName} className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {staffName} - Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.comparison.analysisNotes[0] || 'Failed to process this staff member'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={staffName}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{staffName}</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {result.results.preferredStaffFilter.taskCount} tasks
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {result.comparison.commonTasks} common
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Preferred Staff Filter</div>
                <div className="text-2xl font-bold">{result.results.preferredStaffFilter.taskCount}</div>
                <div className="text-xs text-muted-foreground">
                  {result.results.preferredStaffFilter.totalHours} hours
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Senior Skill Filter</div>
                <div className="text-2xl font-bold">{result.results.skillFilter.taskCount}</div>
                <div className="text-xs text-muted-foreground">
                  {result.results.skillFilter.totalHours} hours
                </div>
              </div>
            </div>

            {result.comparison.analysisNotes.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Key Insights:</div>
                {result.comparison.analysisNotes.slice(0, 2).map((note, index) => (
                  <div key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}
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
          <span>Multi-Staff Filter Comparison Report</span>
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
                <Users className="h-4 w-4" />
                Run Multi-Staff Comparison
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
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {comparisonResult.staffComparisons.length} staff
                </span>
              </div>
            </div>

            <Separator />

            {/* Aggregated Metrics */}
            {renderAggregatedMetrics()}

            {/* Individual Staff Comparisons */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Staff Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonResult.staffComparisons.map(renderStaffComparison)}
                </div>
              </TabsContent>

              <TabsContent value="detailed">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {comparisonResult.staffComparisons.map((staffComparison) => (
                      <div key={staffComparison.staffName} className="space-y-4">
                        <h4 className="font-medium text-lg">{staffComparison.staffName} - Detailed Analysis</h4>
                        
                        {staffComparison.result.comparison.analysisNotes.length > 0 && (
                          <div className="space-y-2">
                            {staffComparison.result.comparison.analysisNotes.map((note, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {staffComparison !== comparisonResult.staffComparisons[comparisonResult.staffComparisons.length - 1] && (
                          <Separator />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!comparisonResult && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Multi-Staff Comparison" to analyze the difference between</p>
            <p>Marciano, Maria, and Luis's preferred staff filters and the Senior skill filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
