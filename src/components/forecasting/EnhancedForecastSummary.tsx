
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ForecastInfoTooltip from './ForecastInfoTooltip';

interface EnhancedForecastSummaryProps {
  totalDemand: React.ReactNode;  // Updated to ReactNode to accept both numbers and React Elements
  totalCapacity: number;
  gap: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

const EnhancedForecastSummary: React.FC<EnhancedForecastSummaryProps> = ({
  totalDemand,
  totalCapacity,
  gap,
  totalRevenue,
  totalCost,
  totalProfit
}) => {
  // Format numbers for display - ensure we show 1 decimal place for hours
  const formatHours = (hours: number) => `${(Math.round(hours * 10) / 10).toFixed(1)} hours`;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  const gapColor = gap < 0
    ? "text-red-500"
    : gap > 0 
      ? "text-green-500" 
      : "text-amber-500";

  const profitColor = totalProfit < 0
    ? "text-red-500"
    : "text-green-500";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Capacity & Demand Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Total Demand
                <ForecastInfoTooltip 
                  title="Total Demand"
                  content="The total number of work hours needed based on tasks in the forecast period."
                />
              </div>
              <div className="text-2xl font-bold">
                {typeof totalDemand === 'number' ? formatHours(totalDemand) : totalDemand}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Total Capacity
                <ForecastInfoTooltip 
                  title="Total Capacity"
                  content="The total available work hours from all staff during the forecast period."
                />
              </div>
              <div className="text-2xl font-bold">{formatHours(totalCapacity)}</div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Capacity Gap
                <ForecastInfoTooltip 
                  title="Capacity Gap"
                  content="The difference between capacity and demand. Negative values (red) indicate a shortage of capacity."
                />
              </div>
              <div className={`text-2xl font-bold ${gapColor}`}>
                {gap > 0 ? '+' : ''}{formatHours(gap)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Financial Summary */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Projected Revenue
                <ForecastInfoTooltip 
                  title="Projected Revenue"
                  content="The estimated revenue from all tasks in the forecast period."
                />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Projected Cost
                <ForecastInfoTooltip 
                  title="Projected Cost"
                  content="The estimated cost (based on staff hourly rates) for all tasks in the forecast period."
                />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Projected Profit
                <ForecastInfoTooltip 
                  title="Projected Profit"
                  content="The estimated profit (revenue minus cost) for the forecast period."
                />
              </div>
              <div className={`text-2xl font-bold ${profitColor}`}>
                {formatCurrency(totalProfit)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedForecastSummary;
