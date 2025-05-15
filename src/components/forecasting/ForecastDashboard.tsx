
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ForecastSummary from './ForecastSummary';
import ForecastChart from './ForecastChart';
import GapAnalysisTable from './GapAnalysisTable';
import FinancialProjections from './FinancialProjections';
import { getForecast } from '@/services/forecastingService';
import useAppEvent from '@/hooks/useAppEvent';
import { ForecastData, ForecastParameters, ForecastResult, SkillData } from '@/types/forecasting';

const ForecastDashboard: React.FC = () => {
  const [forecastWindow, setForecastWindow] = useState<string>('next-30-days');
  const [forecastType, setForecastType] = useState<string>('virtual');
  const [showCapacity, setShowCapacity] = useState<boolean>(true);
  const [showDemand, setShowDemand] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  
  const availableSkills: SkillData[] = [
    { id: 'tax-prep', name: 'Tax Preparation', color: '#4CAF50' },
    { id: 'audit', name: 'Audit', color: '#2196F3' },
    { id: 'advisory', name: 'Advisory', color: '#9C27B0' },
    { id: 'bookkeeping', name: 'Bookkeeping', color: '#FF9800' }
  ];
  
  // Load forecast data
  useEffect(() => {
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        // Create forecast parameters
        const params: ForecastParameters = {
          mode: forecastType as any,
          timeframe: 'month',
          dateRange: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          granularity: 'weekly',
          includeSkills: 'all'
        };
        
        // Get forecast data
        const result = await getForecast(params);
        
        // Process the result into the format expected by components
        const processedData: ForecastData = {
          period: 'current',
          demand: [],
          capacity: [],
          
          // Summary data from the forecast result
          demandHours: result.summary.totalDemand,
          capacityHours: result.summary.totalCapacity,
          gapHours: result.summary.gap,
          projectedRevenue: result.summary.totalRevenue,
          projectedCost: result.summary.totalCost,
          projectedProfit: result.summary.totalProfit,
          
          // Additional data for charts and tables
          timeSeriesData: result.data,
          skillDistribution: result.data,
          gapAnalysis: result.data,
          financialProjections: result.financials
        };
        
        setForecastData(processedData);
      } catch (error) {
        console.error("Error loading forecast:", error);
        toast({
          title: "Error loading forecast",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForecast();
  }, [forecastWindow, forecastType, toast]);
  
  // Listen for forecast recalculation events
  useAppEvent('forecast.recalculated', (event) => {
    toast({
      title: "Forecast recalculated",
      description: `Trigger: ${event.payload.trigger}`,
    });
    
    // Reload forecast data
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        // Create forecast parameters
        const params: ForecastParameters = {
          mode: forecastType as any,
          timeframe: 'month',
          dateRange: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          granularity: 'weekly',
          includeSkills: 'all'
        };
        
        // Get forecast data
        const result = await getForecast(params);
        
        // Process the result into the format expected by components
        const processedData: ForecastData = {
          period: 'current',
          demand: [],
          capacity: [],
          
          // Summary data from the forecast result
          demandHours: result.summary.totalDemand,
          capacityHours: result.summary.totalCapacity,
          gapHours: result.summary.gap,
          projectedRevenue: result.summary.totalRevenue,
          projectedCost: result.summary.totalCost,
          projectedProfit: result.summary.totalProfit,
          
          // Additional data for charts and tables
          timeSeriesData: result.data,
          skillDistribution: result.data,
          gapAnalysis: result.data,
          financialProjections: result.financials
        };
        
        setForecastData(processedData);
      } catch (error) {
        console.error("Error reloading forecast:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForecast();
  }, [forecastWindow, forecastType]);
  
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
        <h1 className="text-2xl font-bold">Capacity Forecasting</h1>
        
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
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={forecastWindow} onValueChange={setForecastWindow}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next-7-days">Next 7 Days</SelectItem>
                <SelectItem value="next-30-days">Next 30 Days</SelectItem>
                <SelectItem value="next-90-days">Next 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm">
            Recalculate
          </Button>
        </div>
      </div>
      
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
          </TabsList>
          
          <TabsContent value="summary">
            {forecastData && (
              <ForecastSummary 
                totalDemand={forecastData.demandHours || 0}
                totalCapacity={forecastData.capacityHours || 0}
                gap={forecastData.gapHours || 0}
                totalRevenue={forecastData.projectedRevenue || 0}
                totalCost={forecastData.projectedCost || 0}
                totalProfit={forecastData.projectedProfit || 0}
              />
            )}
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-md font-medium">Capacity vs. Demand</CardTitle>
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
                  <CardTitle className="text-md font-medium">Skill Distribution</CardTitle>
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
                <CardTitle>Gap Analysis</CardTitle>
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
                <CardTitle>Financial Projections</CardTitle>
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
        </Tabs>
      )}
    </div>
  );
};

export default ForecastDashboard;
