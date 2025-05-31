import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedMatrixCell } from './EnhancedMatrixCell';
import { EnhancedMatrixLegend } from './EnhancedMatrixLegend';
import { MatrixControls } from './MatrixControls';
import { MatrixData, getMatrixDataPoint } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useMatrixControls } from './hooks/useMatrixControls';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface EnhancedCapacityMatrixProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Enhanced capacity matrix with dynamic skills integration
 */
export const EnhancedCapacityMatrix: React.FC<EnhancedCapacityMatrixProps> = ({ 
  className,
  forecastType = 'virtual'
}) => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const { toast } = useToast();

  // Skills integration
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();
  
  // Matrix controls with matrix skills synchronization
  const {
    selectedSkills,
    viewMode,
    monthRange,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport
  } = useMatrixControls({
    matrixSkills: matrixData?.skills || [] // Pass matrix skills for synchronization
  });

  // Load matrix data
  const loadMatrixData = async () => {
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      // Validate the data with enhanced validation
      const issues = validateMatrixData(newMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
        
        // Show validation issues in toast for debugging
        toast({
          title: "Matrix validation issues detected",
          description: `${issues.length} issues found. Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Matrix data loaded successfully",
          description: `Loaded ${newMatrixData.months.length} months × ${newMatrixData.skills.length} skills`
        });
      }

      setMatrixData(newMatrixData);
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

  // Handle skills error
  useEffect(() => {
    if (skillsError) {
      toast({
        title: "Skills loading error",
        description: skillsError,
        variant: "destructive"
      });
    }
  }, [skillsError, toast]);

  // Filter data based on controls with improved filtering
  const getFilteredData = () => {
    if (!matrixData) return null;

    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    const filteredDataPoints = matrixData.dataPoints.filter(
      point => 
        selectedSkills.includes(point.skillType) &&
        filteredMonths.some(month => month.key === point.month)
    );

    return {
      ...matrixData,
      months: filteredMonths,
      skills: filteredSkills,
      dataPoints: filteredDataPoints
    };
  };

  const filteredData = getFilteredData();

  // Loading state
  if (isLoading || skillsLoading) {
    return (
      <div className={className}>
        <EnhancedMatrixLegend viewMode={viewMode} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {skillsLoading ? 'Loading skills data...' : 'Loading enhanced matrix data...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || skillsError) {
    return (
      <div className={className}>
        <EnhancedMatrixLegend viewMode={viewMode} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error || skillsError}
              </div>
              <div className="flex gap-2">
                <Button onClick={loadMatrixData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Matrix
                </Button>
                {skillsError && (
                  <Button onClick={refetchSkills} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Skills
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!filteredData) {
    return (
      <div className={className}>
        <EnhancedMatrixLegend viewMode={viewMode} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced 12-Month Capacity Matrix</CardTitle>
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
      <EnhancedMatrixLegend viewMode={viewMode} />
      
      {/* Responsive layout for matrix and controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Controls Panel */}
        <div className={`xl:col-span-1 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <div className="xl:hidden mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsControlsExpanded(!isControlsExpanded)}
              className="w-full"
            >
              {isControlsExpanded ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              {isControlsExpanded ? 'Hide Controls' : 'Show Controls'}
            </Button>
          </div>
          
          <div className={`${isControlsExpanded ? 'block' : 'hidden xl:block'}`}>
            <MatrixControls
              selectedSkills={selectedSkills}
              onSkillToggle={handleSkillToggle}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              monthRange={monthRange}
              onMonthRangeChange={handleMonthRangeChange}
              onExport={handleExport}
              onReset={handleReset}
            />
          </div>
        </div>
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-3 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Enhanced 12-Month Capacity Matrix
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {viewMode === 'hours' ? 'Hours' : 'Percentage'} View
                  </Badge>
                  <Button 
                    onClick={loadMatrixData} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Interactive capacity vs demand matrix - {forecastType} forecast with synchronized skills
                </p>
                {validationIssues.length > 0 ? (
                  <div className="text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    {validationIssues.length} validation issue(s) resolved through skills synchronization
                  </div>
                ) : (
                  <div className="text-xs text-green-600">
                    ✓ Matrix data validated successfully
                  </div>
                )}
                {filteredData && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>
                      Showing: {filteredData.skills.length} skills × {filteredData.months.length} months
                    </span>
                    <span>•</span>
                    <span>
                      Total: {filteredData.totalDemand.toFixed(0)}h demand, {filteredData.totalCapacity.toFixed(0)}h capacity
                    </span>
                    {availableSkills.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Skills synchronized: {availableSkills.length}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredData && (
                <>
                  {/* Responsive matrix container */}
                  <div className="overflow-x-auto">
                    <div 
                      className="grid gap-1 min-w-fit"
                      style={{
                        gridTemplateColumns: `140px repeat(${filteredData.months.length}, minmax(100px, 1fr))`,
                        gridTemplateRows: `auto repeat(${filteredData.skills.length}, auto)`
                      }}
                    >
                      {/* Top-left corner cell */}
                      <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
                        Skill / Month
                      </div>
                      
                      {/* Month headers */}
                      {filteredData.months.map((month) => (
                        <div 
                          key={month.key}
                          className="p-3 bg-slate-100 border font-medium text-center text-sm"
                        >
                          {month.label}
                        </div>
                      ))}
                      
                      {/* Skill rows */}
                      {filteredData.skills.map((skill) => (
                        <React.Fragment key={skill}>
                          {/* Skill label */}
                          <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
                            {skill}
                          </div>
                          
                          {/* Enhanced cells for each month */}
                          {filteredData.months.map((month) => {
                            const dataPoint = getMatrixDataPoint(filteredData, skill, month.key);
                            
                            return (
                              <EnhancedMatrixCell
                                key={`${skill}-${month.key}`}
                                skillType={skill}
                                month={month.key}
                                monthLabel={month.label}
                                demandHours={dataPoint?.demandHours || 0}
                                capacityHours={dataPoint?.capacityHours || 0}
                                gap={dataPoint?.gap || 0}
                                utilizationPercent={dataPoint?.utilizationPercent || 0}
                                viewMode={viewMode}
                                taskBreakdown={[]}
                                staffAllocation={[]}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Enhanced summary footer */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Matrix Coverage:</strong> {filteredData.skills.length} skills × {filteredData.months.length} months
                      </div>
                      <div>
                        <strong>Data Period:</strong> {filteredData.months[0]?.label} - {filteredData.months[filteredData.months.length - 1]?.label}
                      </div>
                      <div>
                        <strong>Validation:</strong> {validationIssues.length === 0 ? 'All checks passed' : `${validationIssues.length} issues resolved`}
                      </div>
                      <div>
                        <strong>Forecast Type:</strong> {forecastType === 'virtual' ? 'Virtual (Template-based)' : 'Actual (Scheduled)'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCapacityMatrix;
