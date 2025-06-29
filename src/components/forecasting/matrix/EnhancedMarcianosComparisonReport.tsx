
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDemandMatrixData } from './hooks/useDemandMatrixData';
import { 
  EnhancedFilterComparisonService, 
  EnhancedFilterComparisonResult 
} from '@/services/forecasting/demand/performance/filtering/enhancedFilterComparisonService';
import { Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Filter, Bug } from 'lucide-react';

export const EnhancedMarcianosComparisonReport: React.FC = () => {
  const { demandData, isLoading, error } = useDemandMatrixData('skill');
  const [comparisonResult, setComparisonResult] = useState<EnhancedFilterComparisonResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const runEnhancedComparison = async () => {
    if (!demandData) {
      setTestError('No demand data available');
      return;
    }

    setIsRunning(true);
    setTestError(null);
    
    try {
      console.log('🚀 [ENHANCED MARCIANO COMPARISON] Starting enhanced debugging comparison...');
      
      const result = await EnhancedFilterComparisonService.compareFiltersWithEnhancedDebugging(
        demandData,
        'Marciano Urbaez',
        'Senior'
      );
      
      setComparisonResult(result);
      console.log('✅ [ENHANCED MARCIANO COMPARISON] Enhanced debugging complete:', result);
      
    } catch (error) {
      console.error('❌ [ENHANCED MARCIANO COMPARISON] Enhanced debugging failed:', error);
      setTestError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const renderCrossComparisonInsights = () => {
    if (!comparisonResult?.crossComparisonInsights) return null;

    const { crossComparisonInsights } = comparisonResult;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="h-5 w-5 text-purple-500" />
            Enhanced Cross-Comparison Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {crossComparisonInsights.commonDataPoints}
              </div>
              <div className="text-sm text-blue-700">Common Data Points</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {crossComparisonInsights.uniqueToPreferredStaff}
              </div>
              <div className="text-sm text-green-700">Unique to Staff Filter</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {crossComparisonInsights.uniqueToSkill}
              </div>
              <div className="text-sm text-orange-700">Unique to Skill Filter</div>
            </div>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {crossComparisonInsights.debuggingNotes.map((note, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {note}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderSummaryCards = () => {
    if (!comparisonResult) return null;

    const { results } = comparisonResult;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Staff Filter</div>
                <div className="text-2xl font-bold">{results.preferredStaffFilter.dataPoints}</div>
                <div className="text-xs text-muted-foreground">
                  {results.preferredStaffFilter.taskCount} tasks
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
                <div className="text-sm font-medium">Skill Filter</div>
                <div className="text-2xl font-bold">{results.skillFilter.dataPoints}</div>
                <div className="text-xs text-muted-foreground">
                  {results.skillFilter.taskCount} tasks
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
                <div className="text-sm font-medium">Common Data Points</div>
                <div className="text-2xl font-bold">{comparisonResult.crossComparisonInsights.commonDataPoints}</div>
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
                <div className="text-sm font-medium">Execution Time</div>
                <div className="text-2xl font-bold">{comparisonResult.executionTime.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">
                  milliseconds
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
          <span className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Enhanced Marciano's Debugging Report
          </span>
          <Button 
            onClick={runEnhancedComparison}
            disabled={isRunning || !demandData}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running Enhanced Debug...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4" />
                Run Enhanced Debug
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

            {/* Cross-Comparison Insights */}
            {renderCrossComparisonInsights()}

            {/* Console Log Notice */}
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <strong>Enhanced Debugging Active:</strong> Check the browser console for detailed 
                cross-comparison logging between SKILL and STAFF ID filtering. The enhanced debugging 
                shows exactly why results differ between the two filtering methods.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!comparisonResult && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Enhanced Debug" to start comprehensive</p>
            <p>cross-comparison analysis with detailed console logging</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
