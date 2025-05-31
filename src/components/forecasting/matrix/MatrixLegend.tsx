
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Color coding legend component for the capacity matrix
 * Explains the utilization color scheme
 */
export const MatrixLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-green-100 border-green-200', label: 'Low Utilization (≤50%)', textColor: 'text-green-700' },
    { color: 'bg-yellow-100 border-yellow-200', label: 'Moderate Utilization (51-80%)', textColor: 'text-yellow-700' },
    { color: 'bg-orange-100 border-orange-200', label: 'High Utilization (81-100%)', textColor: 'text-orange-700' },
    { color: 'bg-red-100 border-red-200', label: 'Over Capacity (>100%)', textColor: 'text-red-700' }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Utilization Legend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 border rounded ${item.color}`} />
              <span className={`text-xs ${item.textColor}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixLegend;
