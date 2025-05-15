import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRange } from "@/types/forecasting";
import { useToast } from "@/components/ui/use-toast";
import { addDays, addMonths, addWeeks, startOfWeek, startOfMonth, startOfQuarter, endOfWeek, endOfMonth, endOfQuarter } from "date-fns";
import ForecastChart from "./ForecastChart";
import ForecastSummary from "./ForecastSummary";
import GapAnalysisTable from "./GapAnalysisTable";
import FinancialProjections from "./FinancialProjections";
import { useAppEvent } from "@/hooks/useAppEvent";
import { fetchForecast } from "@/services/forecastingService";
import { useQuery } from "@tanstack/react-query";

// ForecastDashboard component 
const ForecastDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demand");
  const [timeframe, setTimeframe] = useState("month");
  const [mode, setMode] = useState("virtual");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  
  // Set up forecast fetching query
  const { 
    data: forecastData, 
    refetch: refetchForecast,
    isLoading
  } = useQuery({
    queryKey: ["forecast", mode, timeframe, dateRange],
    queryFn: () => fetchForecast({
      mode: mode === "virtual" ? "virtual" : "actual",
      timeframe: timeframe as any,
      dateRange,
      granularity: "weekly",
      includeSkills: "all"
    }),
  });
  
  // Listen for forecast recalculation events
  useAppEvent("forecast.recalculated", (event) => {
    const { trigger, mode: eventMode } = event.payload;
    
    // Only refetch if we're in the mode that was affected
    if (!eventMode || eventMode === mode) {
      toast({
        title: "Forecast recalculation",
        description: `Refreshing forecast due to ${trigger}`,
      });
      
      refetchForecast();
    }
  }, [mode, refetchForecast]);
  
  // Handle timeframe changes
  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    
    // Update date range based on timeframe
    const today = new Date();
    
    switch (tf) {
      case "week":
        setDateRange({
          startDate: startOfWeek(today),
          endDate: endOfWeek(today)
        });
        break;
      case "month":
        setDateRange({
          startDate: startOfMonth(today),
          endDate: endOfMonth(today)
        });
        break;
      case "quarter":
        setDateRange({
          startDate: startOfQuarter(today),
          endDate: endOfQuarter(today)
        });
        break;
      default:
        // Keep current range for custom
        break;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Forecasting</h1>
        
        <div className="flex items-center gap-4">
          {/* Mode toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex">
            <Button 
              variant={mode === "virtual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("virtual")}
              className="min-w-24"
            >
              Virtual
            </Button>
            <Button 
              variant={mode === "actual" ? "default" : "ghost"}
              size="sm" 
              onClick={() => setMode("actual")}
              className="min-w-24"
            >
              Actual
            </Button>
          </div>
          
          {/* Timeframe selector */}
          <div className="bg-slate-100 p-1 rounded-lg flex">
            <Button 
              variant={timeframe === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange("week")}
            >
              Week
            </Button>
            <Button 
              variant={timeframe === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange("month")}
            >
              Month
            </Button>
            <Button 
              variant={timeframe === "quarter" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange("quarter")}
            >
              Quarter
            </Button>
          </div>
        </div>
      </div>
      
      {/* Summary cards */}
      {forecastData && (
        <ForecastSummary data={forecastData.summary} />
      )}
      
      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand vs Capacity</TabsTrigger>
          <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
          <TabsTrigger value="financial">Financial Projections</TabsTrigger>
          <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demand vs Capacity Forecast</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {forecastData && (
                <ForecastChart data={forecastData.data} />
              )}
              {isLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis by Skill Type</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastData && (
                <GapAnalysisTable data={forecastData.data} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Projections</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastData && (
                <FinancialProjections 
                  data={forecastData.financials} 
                  view="chart" 
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastData && (
                <FinancialProjections 
                  data={forecastData.financials} 
                  view="table" 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Data Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Additional detailed content would go here */}
              <div className="text-center text-muted-foreground py-8">
                Detailed breakdown view to be implemented
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastDashboard;
