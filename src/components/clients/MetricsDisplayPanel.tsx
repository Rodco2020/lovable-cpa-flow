
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building, DollarSign, FileText, Filter, Loader2 } from 'lucide-react';
import { FilteredClientStats } from '@/types/clientMetrics';

interface MetricsDisplayPanelProps {
  stats: FilteredClientStats;
  isLoading?: boolean;
  isVisible?: boolean;
}

/**
 * Metrics Display Panel - Phase 1
 * 
 * Displays filtered client metrics with clear visual indicators
 */
export const MetricsDisplayPanel: React.FC<MetricsDisplayPanelProps> = ({ 
  stats, 
  isLoading = false,
  isVisible = true 
}) => {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to display stat value with loading state
  const displayStatValue = (value: number | undefined) => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    return value?.toLocaleString() || '0';
  };

  // Helper function to display revenue with loading state
  const displayRevenueValue = (value: number | undefined) => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    return formatCurrency(value || 0);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-700">Filtered Results</h3>
        <Badge variant="outline" className="text-xs">
          {stats.totalClients} clients
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Clients</div>
              <div className="text-lg font-semibold">
                {displayStatValue(stats.totalClients)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-2">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Clients</div>
              <div className="text-lg font-semibold">
                {displayStatValue(stats.activeClients)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Monthly Revenue</div>
              <div className="text-lg font-semibold">
                {displayRevenueValue(stats.totalMonthlyRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="rounded-full bg-amber-100 p-2">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Engagements</div>
              <div className="text-lg font-semibold">
                {displayStatValue(stats.activeEngagements)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.averageRevenuePerClient > 0 && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Average Revenue per Client</div>
            <div className="text-sm font-semibold text-indigo-700">
              {displayRevenueValue(stats.averageRevenuePerClient)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetricsDisplayPanel;
