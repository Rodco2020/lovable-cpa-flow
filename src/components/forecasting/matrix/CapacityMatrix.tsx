
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatrixCell } from './MatrixCell';
import { MatrixLegend } from './MatrixLegend';
import { MatrixData, getMatrixDataPoint } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CapacityMatrixProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Main matrix component with 12-month grid using real forecast data
 */
export const CapacityMatrix: React.FC<CapacityMatrixProps> = ({ 
  className,
  forecastType = 'virtual'
}) => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const { toast } = useToast();

  // Load matrix data
  const loadMatrixData = async () => {
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      // Validate the data
      const issues = validateMatrixData(newMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
      }

      setMatrixData(newMatrixData);
      
      toast({
        title: "Matrix data loaded",
        description: `Loaded ${newMatrixData.months.length} months with ${newMatrixData.dataPoints.length} data points`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      setError(errorMessage);
      console.error('Error loading matrix data:', err);
      
      toast({
        title: "Error loading matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when forecast type changes
  useEffect(() => {
    loadMatrixData();
  }, [forecastType]);

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <MatrixLegend />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">12-Month Capacity Forecast Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading matrix data...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <MatrixLegend />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">12-Month Capacity Forecast Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
              <Button onClick={loadMatrixData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!matrixData) {
    return (
      <div className={className}>
        <MatrixLegend />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">12-Month Capacity Forecast Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No matrix data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <MatrixLegend />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            12-Month Capacity Forecast Matrix
            <Button 
              onClick={loadMatrixData} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Demand vs Capacity by skill type across 12 months (hours) - {forecastType} forecast
            </p>
            {validationIssues.length > 0 && (
              <div className="text-xs text-amber-600">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {validationIssues.length} validation issue(s) detected
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Total: {matrixData.totalDemand.toFixed(0)}h demand, {matrixData.totalCapacity.toFixed(0)}h capacity
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Responsive grid container */}
          <div className="overflow-x-auto">
            <div 
              className="grid gap-1 min-w-[800px]"
              style={{
                gridTemplateColumns: `120px repeat(${matrixData.months.length}, 1fr)`,
                gridTemplateRows: `auto repeat(${matrixData.skills.length}, auto)`
              }}
            >
              {/* Top-left corner cell */}
              <div className="p-2 bg-gray-50 border font-medium text-sm flex items-center">
                Skill / Month
              </div>
              
              {/* Month headers */}
              {matrixData.months.map((month) => (
                <div 
                  key={month.key}
                  className="p-2 bg-gray-50 border font-medium text-center text-sm"
                >
                  {month.label}
                </div>
              ))}
              
              {/* Skill rows */}
              {matrixData.skills.map((skill) => (
                <React.Fragment key={skill}>
                  {/* Skill label */}
                  <div className="p-2 bg-gray-50 border font-medium text-sm flex items-center">
                    {skill}
                  </div>
                  
                  {/* Cells for each month */}
                  {matrixData.months.map((month) => {
                    const dataPoint = getMatrixDataPoint(matrixData, skill, month.key);
                    const demandHours = dataPoint?.demandHours || 0;
                    const capacityHours = dataPoint?.capacityHours || 0;
                    
                    return (
                      <MatrixCell
                        key={`${skill}-${month.key}`}
                        skillType={skill}
                        month={month.label}
                        demandHours={demandHours}
                        capacityHours={capacityHours}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Summary footer */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Matrix View:</strong> Each cell shows demand/capacity hours and utilization percentage.
              </div>
              <div>
                <strong>Data Period:</strong> {matrixData.months[0]?.label} - {matrixData.months[matrixData.months.length - 1]?.label}
              </div>
              <div>
                <strong>Coverage:</strong> {matrixData.skills.length} skills × {matrixData.months.length} months
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacityMatrix;
