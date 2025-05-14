
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, LineChart, Calendar, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { ForecastParameters, ForecastMode, ForecastTimeframe, GranularityType, SkillType } from '@/types/forecasting';
import { getForecast, clearForecastCache } from '@/services/forecastingService';
import ForecastChart from './ForecastChart';
import ForecastSummary from './ForecastSummary';
import GapAnalysisTable from './GapAnalysisTable';
import FinancialProjections from './FinancialProjections';

const ForecastDashboard: React.FC = () => {
  // Forecast parameters
  const [parameters, setParameters] = useState<ForecastParameters>({
    mode: 'virtual',
    timeframe: 'month',
    dateRange: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    },
    granularity: 'weekly',
    includeSkills: 'all'
  });
  
  // UI state
  const [selectedTab, setSelectedTab] = useState('overview');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [showDemand, setShowDemand] = useState(true);
  const [showCapacity, setShowCapacity] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<SkillType[] | 'all'>('all');
  const [financialView, setFinancialView] = useState<'chart' | 'table'>('chart');
  
  // Available skills
  const availableSkills: SkillType[] = ["Junior", "Senior", "CPA", "Tax Specialist", "Audit", "Advisory", "Bookkeeping"];
  
  // Query for forecast data
  const { data: forecast, isLoading, isError, refetch } = useQuery({
    queryKey: ['forecast', parameters],
    queryFn: () => getForecast(parameters),
  });
  
  // Handle skill selection
  const handleSkillChange = (skill: SkillType, checked: boolean) => {
    setSelectedSkills(prevSkills => {
      if (prevSkills === 'all') {
        // If we're currently showing all skills, switch to showing only the selected skill
        return checked ? [skill] : availableSkills.filter(s => s !== skill);
      } else {
        // Add or remove the skill from the selection
        if (checked) {
          return [...prevSkills, skill];
        } else {
          return prevSkills.filter(s => s !== skill);
        }
      }
    });
  };
  
  // Handle showing all skills
  const handleShowAllSkills = (checked: boolean) => {
    setSelectedSkills(checked ? 'all' : []);
  };
  
  // Handle parameter changes
  const updateParameter = <K extends keyof ForecastParameters>(
    key: K, 
    value: ForecastParameters[K]
  ) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle refresh
  const handleRefresh = () => {
    clearForecastCache(); // Clear the cache to force a fresh calculation
    refetch();
    toast({
      title: "Forecast Refreshed",
      description: `Forecast data has been recalculated as of ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
    });
  };
  
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Error loading forecast data.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Forecasting Module</h1>
        <Button onClick={handleRefresh} variant="outline">
          Refresh Forecast
        </Button>
      </div>
      
      {/* Parameter controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="space-y-2">
              <Label>Forecast Mode</Label>
              <Tabs 
                value={parameters.mode} 
                onValueChange={(value) => updateParameter('mode', value as ForecastMode)}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="virtual" className="flex-1">Virtual</TabsTrigger>
                  <TabsTrigger value="actual" className="flex-1">Actual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select 
                value={parameters.timeframe}
                onValueChange={(value) => updateParameter('timeframe', value as ForecastTimeframe)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Granularity</Label>
              <Select 
                value={parameters.granularity}
                onValueChange={(value) => updateParameter('granularity', value as GranularityType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Skill Filter</Label>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => document.getElementById('skill-filter-dialog')?.click()}
              >
                <Filter className="mr-2 h-4 w-4" />
                {selectedSkills === 'all' 
                  ? 'All Skills' 
                  : `${selectedSkills.length} selected`}
              </Button>
              
              {/* This would typically be a dialog, but for simplicity we'll use a dropdown */}
              <div className="hidden">
                <dialog id="skill-filter-dialog">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="show-all-skills"
                        checked={selectedSkills === 'all'}
                        onCheckedChange={handleShowAllSkills}
                      />
                      <Label htmlFor="show-all-skills">Show All Skills</Label>
                    </div>
                    
                    <div className="space-y-2">
                      {availableSkills.map(skill => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`skill-${skill}`}
                            checked={selectedSkills === 'all' || selectedSkills.includes(skill)}
                            onCheckedChange={(checked) => handleSkillChange(skill, checked === true)}
                          />
                          <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="h-10 w-10 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Generating forecast data...</p>
        </div>
      )}
      
      {/* Forecast data */}
      {!isLoading && forecast && (
        <>
          {/* Summary */}
          <ForecastSummary
            totalDemand={forecast.summary.totalDemand}
            totalCapacity={forecast.summary.totalCapacity}
            gap={forecast.summary.gap}
            totalRevenue={forecast.summary.totalRevenue}
            totalCost={forecast.summary.totalCost}
            totalProfit={forecast.summary.totalProfit}
          />
          
          {/* Main tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
              <TabsTrigger value="financial">Financial Projections</TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">{parameters.mode === 'virtual' ? 'Virtual' : 'Actual'} Forecast</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={chartType === 'bar' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setChartType('bar')}
                      >
                        <BarChart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={chartType === 'line' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setChartType('line')}
                      >
                        <LineChart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="show-demand" className="text-sm">Demand</Label>
                      <Switch
                        id="show-demand"
                        checked={showDemand}
                        onCheckedChange={setShowDemand}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="show-capacity" className="text-sm">Capacity</Label>
                      <Switch
                        id="show-capacity"
                        checked={showCapacity}
                        onCheckedChange={setShowCapacity}
                      />
                    </div>
                  </div>
                </div>
                
                <ForecastChart 
                  data={forecast.data}
                  chartType={chartType}
                  showDemand={showDemand}
                  showCapacity={showCapacity}
                  skills={selectedSkills}
                />
              </div>
            </TabsContent>
            
            {/* Gap Analysis tab */}
            <TabsContent value="gap-analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Gap Analysis by Skill</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {parameters.mode === 'virtual' ? 'Virtual' : 'Actual'} Forecast
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <GapAnalysisTable 
                    data={forecast.data} 
                    skills={selectedSkills}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Financial Projections tab */}
            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Financial Projections</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={financialView === 'chart' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFinancialView('chart')}
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Chart
                      </Button>
                      <Button
                        variant={financialView === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFinancialView('table')}
                      >
                        <table className="h-4 w-4 mr-2" />
                        Table
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FinancialProjections 
                    data={forecast.financials}
                    view={financialView}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ForecastDashboard;
