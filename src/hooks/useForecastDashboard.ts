import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import useAppEvent from '@/hooks/useAppEvent';
import { 
  getForecast,
  clearForecastCache,
  validateForecastSystem,
  getTaskBreakdown 
} from '@/services/forecastingService';
import {
  setForecastDebugMode,
  isForecastDebugModeEnabled
} from '@/services/forecasting/logger';
import { runRecurrenceTests } from '@/utils/forecastTestingUtils';
import { 
  ForecastData, 
  ForecastParameters, 
  SkillType,
  SkillData,
  ForecastMode
} from '@/types/forecasting';

export const useForecastDashboard = () => {
  const [forecastWindow, setForecastWindow] = useState<string>('next-30-days');
  const [forecastType, setForecastType] = useState<ForecastMode>('virtual');
  const [showCapacity, setShowCapacity] = useState<boolean>(true);
  const [showDemand, setShowDemand] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(isForecastDebugModeEnabled());
  const { toast } = useToast();

  // Available skills definition - moved from component to hook
  const availableSkills: SkillData[] = [
    { id: 'Junior' as SkillType, name: 'Junior', color: '#9b87f5' },
    { id: 'Senior' as SkillType, name: 'Senior', color: '#7E69AB' },
    { id: 'CPA' as SkillType, name: 'CPA', color: '#6E59A5' },
    { id: 'Tax Specialist' as SkillType, name: 'Tax Specialist', color: '#D946EF' },
    { id: 'Audit' as SkillType, name: 'Audit', color: '#0EA5E9' },
    { id: 'Advisory' as SkillType, name: 'Advisory', color: '#F97316' },
    { id: 'Bookkeeping' as SkillType, name: 'Bookkeeping', color: '#33C3F0' }
  ];
  
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
  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const days = getSelectedWindowDays();
      
      // Create forecast parameters
      const params: ForecastParameters = {
        mode: forecastType,
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
  
  // Handle toggle debug mode
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
    
    // Reload forecast data
    loadForecast();
  };
  
  // Load forecast on initial mount and when window or type changes
  useEffect(() => {
    loadForecast();
  }, [forecastWindow, forecastType]); 
  
  // Listen for forecast recalculation events
  useAppEvent('forecast.recalculated', (event) => {
    toast({
      title: "Forecast recalculated",
      description: `Trigger: ${event.payload.trigger}`,
    });
    
    // Reload forecast data
    loadForecast();
  }, [forecastWindow, forecastType]);
  
  // Helper to render explanation based on forecast type
  const renderForecastExplanation = () => {
    if (forecastType === 'virtual') {
      return "Virtual forecast projects workload based on recurring task templates and staff availability patterns";
    } else {
      return "Actual forecast reflects scheduled tasks and accounts for staff availability exceptions";
    }
  };

  return {
    forecastWindow,
    setForecastWindow,
    forecastType,
    setForecastType,
    showCapacity,
    setShowCapacity,
    showDemand,
    setShowDemand,
    isLoading,
    forecastData,
    selectedSkills,
    setSelectedSkills,
    validationIssues,
    taskBreakdown,
    debugMode,
    timeWindowOptions,
    availableSkills,
    handleToggleDebugMode,
    handleRunTests,
    handleValidateSystem,
    handleRecalculate,
    renderForecastExplanation
  };
};

export default useForecastDashboard;
