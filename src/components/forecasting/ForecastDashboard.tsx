import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Info, ChartBar, Calendar } from 'lucide-react';
import ForecastSummary from './ForecastSummary';
import ForecastChart from './ForecastChart';
import GapAnalysisTable from './GapAnalysisTable';
import FinancialProjections from './FinancialProjections';
import ForecastCalculationBadge from './ForecastCalculationBadge';
import ForecastInfoTooltip from './ForecastInfoTooltip';
import TaskBreakdownHoverCard from './TaskBreakdownHoverCard';
import { 
  getForecast, 
  clearForecastCache, 
  isForecastDebugModeEnabled, 
  setForecastDebugMode,
  validateForecastSystem,
  getTaskBreakdown
} from '@/services/forecastingService';
import { runRecurrenceTests } from '@/utils/forecastTestingUtils';
import useAppEvent from '@/hooks/useAppEvent';
import { ForecastData, ForecastParameters, ForecastResult, SkillType } from '@/types/forecasting';

// Define skill data type for UI display
interface SkillData {
  id: SkillType;
  name: string;
  color: string;
}

const ForecastDashboard: React.FC = () => {
  const [forecastWindow, setForecastWindow] = useState<string>('next-30-days');
  const [forecastType, setForecastType] = useState<string>('virtual');
  const [showCapacity, setShowCapacity] = useState<boolean>(true);
  const [showDemand, setShowDemand] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<any[]>([]);
  const { toast } = useToast();
  
  const availableSkills: SkillData[] = [
    { id: 'Junior' as SkillType, name: 'Junior', color: '#9b87f5' },
    { id: 'Senior' as SkillType, name: 'Senior', color: '#7E69AB' },
    { id: 'CPA' as SkillType, name: 'CPA', color: '#6E59A5' },
    { id: 'Tax Specialist' as SkillType, name: 'Tax Specialist', color: '#D946EF' },
    { id: 'Audit' as SkillType, name: 'Audit', color: '#0EA5E9' },
    { id: 'Advisory' as SkillType, name: 'Advisory', color: '#F97316' },
    { id: 'Bookkeeping' as SkillType, name: 'Bookkeeping', color: '#33C3F0' }
  ];
  
  // Add debug mode state
  const [debugMode, setDebugMode] = useState<boolean>(isForecastDebugModeEnabled());
  
  // Time window options
  const timeWindowOptions = [
    { value: 'next-7-days', label: 'Next 7 Days', days: 7 },
    { value: 'next-30-days', label: 'Next 30 Days', days: 30 },
    { value: 'next-90-days', label: 'Next 90 Days', days: 90 },
    { value: 'custom', label: 'Custom Range', days: 30 }
  ];
  
  // Get selected window days
  const getSelectedWindowDays = () => {
    const option = timeWindowOptions.find(opt => opt.value === forecastWindow);
    return option ? option.days : 30;
  };
  
  // Load forecast data
  useEffect(() => {
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        const days = getSelectedWindowDays();
        
        // Create forecast parameters
        const params: ForecastParameters = {
          mode: forecastType as any,
          timeframe: 'custom',
          dateRange: {
            startDate: new Date(),
            endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
          },
          granularity: 'weekly',
          includeSkills: 'all'
        };
        
        // Get forecast data
        const result = await getForecast(params);
        
        // Process the result into the format expected by components
        const processedData: ForecastData = {
          period: 'current',
          demand: result.data.flatMap(d => d.demand),
          capacity: result.data.flatMap(d => d.capacity),
          
          // Additional data for charts and tables
          timeSeriesData: result.data,
          skillDistribution: result.data,
          gapAnalysis: result.data,
          financialProjections: result.financials,
          
          // Summary data
          demandHours: result.summary.totalDemand,
          capacityHours: result.summary.totalCapacity,
          gapHours: result.summary.gap,
          projectedRevenue: result.summary.totalRevenue,
          projectedCost: result.summary.totalCost,
          projectedProfit: result.summary.totalProfit
        };
        
        setForecastData(processedData);
        
        // Get task breakdown for tooltips
        if (forecastType === 'actual') {
          const breakdown = await getTaskBreakdown(params);
          setTaskBreakdown(breakdown);
        } else {
          setTaskBreakdown([]);
        }
      } catch (error) {
        console.error("Error loading forecast:", error);
        toast({
          title: "Error loading forecast",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForecast();
  }, [forecastWindow, forecastType, toast]);
  
  // Handle debug mode change
  const handleToggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    setForecastDebugMode(newMode);
    toast({
      title: `Debug mode ${newMode ? 'enabled' : 'disabled'}`,
      description: newMode ? "Detailed calculation logs will be shown in console" : "Debug logs disabled"
    });
  };
  
  // Handle running test cases
  const handleRunTests = () => {
    try {
      runRecurrenceTests();
      toast({
        title: "Test cases executed",
        description: "Check browser console for results"
      });
    } catch (error) {
      console.error("Error running tests:", error);
      toast({
        title: "Test execution failed",
        description: error instanceof Error ? error.message : "Check browser console for details",
        variant: "destructive"
      });
    }
  };
  
  // Handle system validation
  const handleValidateSystem = async () => {
    setIsLoading(true);
    try {
      const issues = await validateForecastSystem();
      setValidationIssues(issues);
      
      if (issues.length === 0) {
        toast({
          title: "Validation successful",
          description: "No issues found in the forecasting system"
        });
      } else {
        toast({
          title: `${issues.length} validation issues found`,
          description: "See debug tab for details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating system:", error);
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "Check console for details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle recalculation
  const handleRecalculate = () => {
    clearForecastCache();
    toast({
      title: "Forecast cache cleared",
      description: "Recalculating forecast data..."
    });
    
    // Reload forecast data - reusing code from useEffect
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        const days = getSelectedWindowDays();
        
        // Create forecast parameters
        const params: ForecastParameters = {
          mode: forecastType as any,
          timeframe: 'custom',
          dateRange: {
            startDate: new Date(),
            endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
          },
          granularity: 'weekly',
          includeSkills: 'all'
        };
        
        // Get forecast data
        const result = await getForecast(params);
        
        // Process result (same as in useEffect)
        const processedData: ForecastData = {
          period: 'current',
          demand: result.data.flatMap(d => d.demand),
          capacity: result.data.flatMap(d => d.capacity),
          timeSeriesData: result.data,
          skillDistribution: result.data,
          gapAnalysis: result.data,
          financialProjections: result.financials,
          demandHours: result.summary.totalDemand,
          capacityHours: result.summary.totalCapacity,
          gapHours: result.summary.gap,
          projectedRevenue: result.summary.totalRevenue,
          projectedCost: result.summary.totalCost,
          projectedProfit: result.summary.totalProfit
        };
        
        setForecastData(processedData);
        
        // Get task breakdown
        if (forecastType === 'actual') {
          const breakdown = await getTaskBreakdown(params);
          setTaskBreakdown(breakdown);
        } else {
          setTaskBreakdown([]);
        }
      } catch (error) {
        console.error("Error reloading forecast:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForecast();
  };
  
  // Listen for forecast recalculation events
  useAppEvent('forecast.recalculated', (event) => {
    toast({
      title: "Forecast recalculated",
      description: `Trigger: ${event.payload.trigger}`,
    });
    
    // Reload forecast data (same as handleRecalculate)
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        const days = getSelectedWindowDays();
        
        const params: ForecastParameters = {
          mode: forecastType as any,
          timeframe: 'custom',
          dateRange: {
            startDate: new Date(),
            endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
          },
          granularity: 'weekly',
          includeSkills: 'all'
        };
        
        const result = await getForecast(params);
        
        const processedData: ForecastData = {
          period: 'current',
          demand: result.data.flatMap(d => d.demand),
          capacity: result.data.flatMap(d => d.capacity),
          timeSeriesData: result.data,
          skillDistribution: result.data,
          gapAnalysis: result.data,
          financialProjections: result.financials,
          demandHours: result.summary.totalDemand,
          capacityHours: result.summary.totalCapacity,
          gapHours: result.summary.gap,
          projectedRevenue: result.summary.totalRevenue,
          projectedCost: result.summary.totalCost,
          projectedProfit: result.summary.totalProfit
        };
        
        setForecastData(processedData);
        
        // Get task breakdown
        if (forecastType === 'actual') {
          const breakdown = await getTaskBreakdown(params);
          setTaskBreakdown(breakdown);
        } else {
          setTaskBreakdown([]);
        }
      } catch (error) {
        console.error("Error reloading forecast:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForecast();
  }, [forecastWindow, forecastType]);
  
  // Render explanation based on forecast type
  const renderForecastExplanation = () => {
    if (forecastType === 'virtual') {
      return (
        <p className="text-sm text-muted-foreground">
          Virtual forecast projects workload based on recurring task templates and staff availability patterns
        </p>
      );
    } else {
      return (
        <p className="text-sm text-muted-foreground">
          Actual forecast reflects scheduled tasks and accounts for staff availability exceptions
        </p>
      );
    }
  };
  
  if (!forecastData && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>No forecast data available. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Capacity Forecasting</h1>
          {forecastData && (
            <div className="flex items-center gap-2">
              <ForecastCalculationBadge mode={forecastType as any} />
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={forecastType} onValueChange={setForecastType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Forecast Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual Forecast</SelectItem>
                <SelectItem value="actual">Actual Forecast</SelectItem>
              </SelectContent>
            </Select>
            <ForecastInfoTooltip
              title="Forecast Type"
              content={
                <div className="space-y-2">
                  <p><strong>Virtual Forecast:</strong> Projection based on recurring task templates and standard staff availability.</p>
                  <p><strong>Actual Forecast:</strong> Based on scheduled tasks and actual staff availability including exceptions.</p>
                </div>
              }
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={forecastWindow} onValueChange={setForecastWindow}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Window" />
              </SelectTrigger>
              <SelectContent>
                {timeWindowOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ForecastInfoTooltip
              title="Forecast Window"
              content="Select the time period for your forecast. This determines how far into the future the forecast will project."
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRecalculate}>
            Recalculate
          </Button>
        </div>
      </div>
      
      {renderForecastExplanation()}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <p>Loading forecast data...</p>
        </div>
      ) : (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            {forecastData && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      Forecast Summary
                      <ForecastInfoTooltip
                        title="Forecast Summary"
                        content="This summary shows the total demand, capacity, and gap for the selected time period, along with projected financial metrics."
                      />
                    </CardTitle>
                    <CardDescription>
                      {forecastType === 'virtual' 
                        ? 'Based on recurring task templates and standard availability' 
                        : 'Based on scheduled tasks and actual availability'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForecastSummary 
                      totalDemand={
                        <TaskBreakdownHoverCard
                          tasks={taskBreakdown}
                          title="Tasks Contributing to Demand"
                        >
                          {/* Convert the React node to a simple number */}
                          {forecastData.demandHours || 0}
                        </TaskBreakdownHoverCard>
                      }
                      totalCapacity={forecastData.capacityHours || 0}
                      gap={forecastData.gapHours || 0}
                      totalRevenue={forecastData.projectedRevenue || 0}
                      totalCost={forecastData.projectedCost || 0}
                      totalProfit={forecastData.projectedProfit || 0}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-md font-medium flex items-center gap-2">
                      Capacity vs. Demand
                      <ForecastInfoTooltip
                        title="Capacity vs. Demand"
                        content="This chart compares staff capacity (available hours) against demand (required hours) over time. Toggle to show or hide capacity and demand lines."
                        icon={<ChartBar className="h-4 w-4" />}
                      />
                    </CardTitle>
                    <CardDescription>
                      {forecastType === 'virtual' 
                        ? 'Projection based on templates' 
                        : 'Based on scheduled instances'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch id="show-demand" checked={showDemand} onCheckedChange={setShowDemand} />
                      <Label htmlFor="show-demand">Demand</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="show-capacity" checked={showCapacity} onCheckedChange={setShowCapacity} />
                      <Label htmlFor="show-capacity">Capacity</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {forecastData && forecastData.timeSeriesData && (
                    <ForecastChart 
                      chartType="line"
                      data={forecastData.timeSeriesData}
                      showDemand={showDemand}
                      showCapacity={showCapacity}
                      skills={availableSkills}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md font-medium flex items-center gap-2">
                    Skill Distribution
                    <ForecastInfoTooltip
                      title="Skill Distribution"
                      content="This chart shows how different skills contribute to overall capacity and demand. Use this to identify skill-specific gaps or surpluses."
                      icon={<ChartBar className="h-4 w-4" />}
                    />
                  </CardTitle>
                  <CardDescription>
                    Breakdown by skill type for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forecastData && forecastData.skillDistribution && (
                    <ForecastChart 
                      chartType="bar"
                      data={forecastData.skillDistribution}
                      showDemand={showDemand}
                      showCapacity={showCapacity}
                      skills={availableSkills}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="gaps">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Gap Analysis
                  <ForecastInfoTooltip
                    title="Gap Analysis"
                    content="This table shows the difference between capacity and demand for each skill. Negative values (highlighted) indicate potential resource shortages."
                  />
                </CardTitle>
                <CardDescription>
                  Identifying potential resource shortages or surpluses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecastData && forecastData.gapAnalysis && (
                  <GapAnalysisTable 
                    data={forecastData.gapAnalysis}
                    skills={availableSkills.map(s => s.id)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Financial Projections
                  <ForecastInfoTooltip
                    title="Financial Projections"
                    content="These projections are calculated by multiplying forecasted hours by billing/cost rates, showing estimated revenue, cost, and profit over time."
                  />
                </CardTitle>
                <CardDescription>
                  Estimated revenue, cost, and profit based on forecasted hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecastData && forecastData.financialProjections && (
                  <FinancialProjections
                    data={forecastData.financialProjections}
                    view="chart"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="debug">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Calculation Debug</CardTitle>
                  <CardDescription>
                    Tools to help diagnose and validate forecast calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="debug-mode" 
                      checked={debugMode} 
                      onCheckedChange={handleToggleDebugMode} 
                    />
                    <Label htmlFor="debug-mode">Enable Debug Mode</Label>
                    <ForecastInfoTooltip
                      title="Debug Mode"
                      content="When enabled, detailed calculation logs will be printed to the browser console, showing each step of the forecast calculation process."
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When debug mode is enabled, detailed calculation logs will be shown in the browser console.
                  </p>
                  
                  <div className="pt-4 space-y-2">
                    <Button onClick={handleRunTests} className="mr-2">
                      Run Test Cases
                    </Button>
                    <Button onClick={handleValidateSystem} variant="outline">
                      Validate System
                    </Button>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Executes test cases for various recurrence patterns, or validates the entire forecast system.
                      Results will be shown in the browser console.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={validationIssues.length > 0 ? "border-amber-500" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validationIssues.length > 0 && (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    Validation Results
                  </CardTitle>
                  <CardDescription>
                    {validationIssues.length === 0 
                      ? "Run validation to check for potential issues" 
                      : `${validationIssues.length} issues found`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {validationIssues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No validation issues detected.
                    </p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationIssues.map((issue, index) => (
                          <li key={index} className="text-sm text-amber-700 dark:text-amber-500">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ForecastDashboard;
