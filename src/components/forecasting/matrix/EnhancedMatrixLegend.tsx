
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnhancedMatrixLegendProps {
  viewMode?: 'hours' | 'percentage';
}

/**
 * Enhanced legend component with detailed color coding explanations
 */
export const EnhancedMatrixLegend: React.FC<EnhancedMatrixLegendProps> = ({ 
  viewMode = 'hours' 
}) => {
  const legendItems = [
    { 
      color: 'bg-red-100 border-red-300', 
      textColor: 'text-red-900',
      icon: <TrendingDown className="h-3 w-3" />,
      label: 'Critical Shortage', 
      description: 'Demand > 150% of capacity',
      severity: 'high'
    },
    { 
      color: 'bg-red-50 border-red-200', 
      textColor: 'text-red-800',
      icon: <TrendingDown className="h-3 w-3" />,
      label: 'Moderate Shortage', 
      description: 'Demand 120-150% of capacity',
      severity: 'medium'
    },
    { 
      color: 'bg-orange-50 border-orange-200', 
      textColor: 'text-orange-800',
      icon: <TrendingDown className="h-3 w-3" />,
      label: 'Minor Shortage', 
      description: 'Demand 100-120% of capacity',
      severity: 'low'
    },
    { 
      color: 'bg-gray-50 border-gray-200', 
      textColor: 'text-gray-800',
      icon: <Minus className="h-3 w-3" />,
      label: 'Balanced', 
      description: 'Demand equals capacity',
      severity: 'balanced'
    },
    { 
      color: 'bg-blue-50 border-blue-200', 
      textColor: 'text-blue-800',
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Minor Surplus', 
      description: 'Capacity 20-50% above demand',
      severity: 'low'
    },
    { 
      color: 'bg-green-50 border-green-200', 
      textColor: 'text-green-800',
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Moderate Surplus', 
      description: 'Capacity 50-100% above demand',
      severity: 'medium'
    },
    { 
      color: 'bg-green-100 border-green-300', 
      textColor: 'text-green-900',
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Large Surplus', 
      description: 'Capacity >100% above demand',
      severity: 'high'
    }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Capacity Utilization Legend
          <Badge variant="outline" className="text-xs">
            {viewMode === 'hours' ? 'Hours View' : 'Percentage View'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Color indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded">
                <div className={`w-4 h-4 border rounded flex items-center justify-center ${item.color}`}>
                  <span className={item.textColor}>
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${item.textColor}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Usage instructions */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>How to read the matrix:</strong> Each cell shows demand/capacity for a skill in a specific month. 
            Colors indicate utilization levels - red for shortages, green for surplus, gray for balanced. 
            Hover over cells for detailed breakdowns including contributing tasks and staff allocation.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMatrixLegend;
