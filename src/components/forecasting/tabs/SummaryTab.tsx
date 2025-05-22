
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ForecastSummary from '../ForecastSummary';
import ForecastInfoTooltip from '../ForecastInfoTooltip';
import TaskBreakdownHoverCard from '../TaskBreakdownHoverCard';
import { ForecastData } from '@/types/forecasting';

interface SummaryTabProps {
  forecastData: ForecastData;
  taskBreakdown: any[];
  forecastType: string;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ 
  forecastData, 
  taskBreakdown,
  forecastType 
}) => {
  return (
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
  );
};

export default SummaryTab;
