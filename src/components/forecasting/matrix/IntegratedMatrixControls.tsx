
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, EyeOff, RotateCcw, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { SkillType } from '@/types/task';
import { TrendAnalysis, CapacityRecommendation, ThresholdAlert } from '@/services/forecasting/analyticsService';

interface IntegratedMatrixControlsProps {
  // Original props
  availableSkills: SkillType[];
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  viewMode: 'hours' | 'percentage';
  onViewModeChange: (mode: 'hours' | 'percentage') => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  
  // Integration props
  forecastType: 'virtual' | 'actual';
  onForecastTypeChange: (type: 'virtual' | 'actual') => void;
  
  // Analytics props
  trends: TrendAnalysis[];
  recommendations: CapacityRecommendation[];
  alerts: ThresholdAlert[];
  
  // Advanced features
  showTrends: boolean;
  onShowTrendsChange: (show: boolean) => void;
  showAlerts: boolean;
  onShowAlertsChange: (show: boolean) => void;
  onGenerateReport: () => void;
  onPrintView: () => void;
  
  className?: string;
}

const MONTH_RANGES = [
  { label: 'All 12 Months', start: 0, end: 11 },
  { label: 'Q1 (Jan-Mar)', start: 0, end: 2 },
  { label: 'Q2 (Apr-Jun)', start: 3, end: 5 },
  { label: 'Q3 (Jul-Sep)', start: 6, end: 8 },
  { label: 'Q4 (Oct-Dec)', start: 9, end: 11 },
  { label: 'Next 6 Months', start: 0, end: 5 },
  { label: 'Last 6 Months', start: 6, end: 11 }
];

/**
 * Enhanced matrix controls with advanced analytics and integration features
 */
export const IntegratedMatrixControls: React.FC<IntegratedMatrixControlsProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  viewMode,
  onViewModeChange,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  forecastType,
  onForecastTypeChange,
  trends,
  recommendations,
  alerts,
  showTrends,
  onShowTrendsChange,
  showAlerts,
  onShowAlertsChange,
  onGenerateReport,
  onPrintView,
  className
}) => {
  const handleSelectAllSkills = () => {
    if (selectedSkills.length === availableSkills.length) {
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  const getCurrentRangeLabel = () => {
    const range = MONTH_RANGES.find(r => r.start === monthRange.start && r.end === monthRange.end);
    return range ? range.label : 'Custom Range';
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');
  const highPriorityRecommendations = recommendations.filter(rec => rec.priority === 'high');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Advanced Matrix Controls
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="display" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          {/* Display Controls */}
          <TabsContent value="display" className="space-y-4">
            {/* Forecast Type Integration */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Forecast Type</Label>
              <Select value={forecastType} onValueChange={onForecastTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual Forecast</SelectItem>
                  <SelectItem value="actual">Actual Forecast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* View Mode */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">View Mode</Label>
              <Select value={viewMode} onValueChange={onViewModeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours View</SelectItem>
                  <SelectItem value="percentage">Percentage View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Month Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Month Range</Label>
              <Select 
                value={`${monthRange.start}-${monthRange.end}`} 
                onValueChange={(value) => {
                  const [start, end] = value.split('-').map(Number);
                  onMonthRangeChange({ start, end });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getCurrentRangeLabel()} />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_RANGES.map((range) => (
                    <SelectItem 
                      key={`${range.start}-${range.end}`} 
                      value={`${range.start}-${range.end}`}
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Skills Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Skills Filter</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllSkills}
                  className="text-xs h-auto p-1"
                >
                  {selectedSkills.length === availableSkills.length ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hide All
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Show All
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableSkills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => onSkillToggle(skill)}
                    />
                    <Label
                      htmlFor={`skill-${skill}`}
                      className="text-xs flex-1 cursor-pointer"
                    >
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {selectedSkills.length} of {availableSkills.length} selected
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Controls */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Trends</Label>
                <Switch checked={showTrends} onCheckedChange={onShowTrendsChange} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Alerts</Label>
                <Switch checked={showAlerts} onCheckedChange={onShowAlertsChange} />
              </div>
            </div>

            <Separator />

            {/* Top Recommendations */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Top Recommendations</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {highPriorityRecommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                    <div className="font-medium text-amber-800">{rec.skill}</div>
                    <div className="text-amber-700">{rec.description}</div>
                  </div>
                ))}
                {highPriorityRecommendations.length === 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    No high-priority recommendations
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Trend Summary */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Trend Summary</Label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {trends.filter(t => t.trend === 'increasing').length}
                  </div>
                  <div className="text-muted-foreground">Growing</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">
                    {trends.filter(t => t.trend === 'stable').length}
                  </div>
                  <div className="text-muted-foreground">Stable</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">
                    {trends.filter(t => t.trend === 'decreasing').length}
                  </div>
                  <div className="text-muted-foreground">Declining</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              {/* Critical Alerts */}
              {criticalAlerts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-red-600">Critical Alerts</Label>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {criticalAlerts.map((alert) => (
                      <div key={alert.id} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <div className="font-medium text-red-800">{alert.skill} - {alert.month}</div>
                        <div className="text-red-700">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Alerts */}
              {warningAlerts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-amber-600">Warning Alerts</Label>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {warningAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                        <div className="font-medium text-amber-800">{alert.skill} - {alert.month}</div>
                        <div className="text-amber-700">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alerts.length === 0 && (
                <div className="text-xs text-muted-foreground italic text-center py-4">
                  No active alerts
                </div>
              )}
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Export Options</Label>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPrintView}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print View
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGenerateReport}
                className="w-full justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IntegratedMatrixControls;
