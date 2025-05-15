
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

export interface ForecastSummaryProps {
  totalDemand: number;
  totalCapacity: number;
  gap: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

const ForecastSummary: React.FC<ForecastSummaryProps> = ({
  totalDemand,
  totalCapacity,
  gap,
  totalRevenue,
  totalCost,
  totalProfit
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatHours = (value: number) => {
    return Math.round(value * 10) / 10; // Round to 1 decimal place
  };
  
  const capacityUtilization = totalCapacity > 0 
    ? ((totalDemand / totalCapacity) * 100).toFixed(1)
    : '0.0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Capacity Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{capacityUtilization}%</div>
            <div className={`flex items-center ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gap >= 0 ? <ArrowUp className="mr-1" /> : <ArrowDown className="mr-1" />}
              <span className="font-medium">{formatHours(Math.abs(gap))} hrs</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <div>Demand: {formatHours(totalDemand)} hrs</div>
            <div>Capacity: {formatHours(totalCapacity)} hrs</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Projected Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-blue-600">
              <TrendingUp />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Based on client monthly revenue
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Projected Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{formatCurrency(totalProfit)}</div>
            <div className={`${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <div>Cost: {formatCurrency(totalCost)}</div>
            <div>Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastSummary;
