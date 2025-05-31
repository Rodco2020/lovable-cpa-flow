
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useForecastDashboard from '@/hooks/useForecastDashboard';

// Import tab components
import ForecastHeader from './ForecastHeader';
import SummaryTab from './tabs/SummaryTab';
import ChartsTab from './tabs/ChartsTab';
import GapsTab from './tabs/GapsTab';
import FinancialTab from './tabs/FinancialTab';
import DebugTab from './tabs/DebugTab';
import { MatrixTab, MatrixErrorBoundary } from './matrix';

/**
 * ForecastDashboard Component
 * 
 * This component serves as the main interface for the forecasting module, providing:
 * - Selection of forecast type (virtual vs actual) and time window
 * - Visualization of capacity vs demand data
 * - Financial projections based on forecasted work
 * - Gap analysis to identify resource shortages
 * - 12-month capacity matrix view with real data
 * - Debugging tools for forecast calculation validation
 */
const ForecastDashboard: React.FC = () => {
  const {
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
  } = useForecastDashboard();

  if (!forecastData && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>No forecast data available. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <ForecastHeader
        forecastData={forecastData}
        forecastType={forecastType}
        setForecastType={setForecastType}
        forecastWindow={forecastWindow}
        setForecastWindow={setForecastWindow}
        timeWindowOptions={timeWindowOptions}
        handleRecalculate={handleRecalculate}
        renderForecastExplanation={renderForecastExplanation}
      />
      
      {/* Content areas */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <p>Loading forecast data...</p>
        </div>
      ) : (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary">
            {forecastData && (
              <SummaryTab 
                forecastData={forecastData}
                taskBreakdown={taskBreakdown}
                forecastType={forecastType}
              />
            )}
          </TabsContent>
          
          {/* Charts Tab */}
          <TabsContent value="charts">
            {forecastData && (
              <ChartsTab 
                forecastData={forecastData}
                showDemand={showDemand}
                setShowDemand={setShowDemand}
                showCapacity={showCapacity}
                setShowCapacity={setShowCapacity}
                forecastType={forecastType}
                skills={availableSkills}
              />
            )}
          </TabsContent>
          
          {/* Matrix Tab - Enhanced with real data and error boundary */}
          <TabsContent value="matrix">
            <MatrixErrorBoundary>
              <MatrixTab forecastType={forecastType} />
            </MatrixErrorBoundary>
          </TabsContent>
          
          {/* Gap Analysis Tab */}
          <TabsContent value="gaps">
            {forecastData && (
              <GapsTab 
                forecastData={forecastData}
                skills={availableSkills.map(s => s.id)}
              />
            )}
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial">
            {forecastData && forecastData.financialProjections && (
              <FinancialTab 
                financialProjections={forecastData.financialProjections}
              />
            )}
          </TabsContent>
          
          {/* Debug Tab */}
          <TabsContent value="debug">
            <DebugTab 
              debugMode={debugMode}
              handleToggleDebugMode={handleToggleDebugMode}
              handleRunTests={handleRunTests}
              handleValidateSystem={handleValidateSystem}
              validationIssues={validationIssues}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ForecastDashboard;
