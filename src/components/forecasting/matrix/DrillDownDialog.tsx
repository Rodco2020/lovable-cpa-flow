
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  Activity,
  Briefcase
} from 'lucide-react';
import { DrillDownData } from '@/services/forecasting/analyticsService';
import { SkillType } from '@/types/task';

interface DrillDownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillType | null;
  month: string | null;
  data: DrillDownData | null;
}

/**
 * Advanced drill-down dialog with detailed analytics and breakdowns
 */
export const DrillDownDialog: React.FC<DrillDownDialogProps> = ({
  isOpen,
  onClose,
  skill,
  month,
  data
}) => {
  if (!data || !skill || !month) {
    return null;
  }

  const totalDemand = data.demandBreakdown.reduce((sum, item) => sum + item.hours, 0);
  const totalCapacity = data.capacityBreakdown.reduce((sum, item) => sum + item.availableHours, 0);
  const totalScheduled = data.capacityBreakdown.reduce((sum, item) => sum + item.scheduledHours, 0);
  const utilizationPercent = totalCapacity > 0 ? (totalScheduled / totalCapacity) * 100 : 0;
  const gap = totalCapacity - totalDemand;

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 2) return 'text-green-600';
    if (trend < -2) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detailed Analysis: {skill} - {month}
            <Badge variant={gap >= 0 ? 'success' : 'destructive'}>
              {gap >= 0 ? 'Surplus' : 'Shortage'}: {Math.abs(gap).toFixed(0)}h
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Demand</span>
                </div>
                <div className="text-2xl font-bold">{totalDemand.toFixed(0)}h</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.demandTrend)}`}>
                  {getTrendIcon(data.trends.demandTrend)}
                  {data.trends.demandTrend.toFixed(1)}% trend
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Capacity</span>
                </div>
                <div className="text-2xl font-bold">{totalCapacity.toFixed(0)}h</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.capacityTrend)}`}>
                  {getTrendIcon(data.trends.capacityTrend)}
                  {data.trends.capacityTrend.toFixed(1)}% trend
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Utilization</span>
                </div>
                <div className="text-2xl font-bold">{utilizationPercent.toFixed(0)}%</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.utilizationTrend)}`}>
                  {getTrendIcon(data.trends.utilizationTrend)}
                  {data.trends.utilizationTrend.toFixed(1)}% trend
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Gap</span>
                </div>
                <div className={`text-2xl font-bold ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gap >= 0 ? '+' : ''}{gap.toFixed(0)}h
                </div>
                <div className="text-xs text-gray-500">
                  {gap >= 0 ? 'Surplus capacity' : 'Capacity shortage'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdowns */}
          <Tabs defaultValue="demand" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demand">Demand Breakdown</TabsTrigger>
              <TabsTrigger value="capacity">Staff Allocation</TabsTrigger>
            </TabsList>

            {/* Demand Breakdown */}
            <TabsContent value="demand" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Demand Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.demandBreakdown.map((item, index) => {
                      const percentage = totalDemand > 0 ? (item.hours / totalDemand) * 100 : 0;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.source}</div>
                              <div className="text-sm text-gray-500">
                                {item.clientCount} clients
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.hours.toFixed(0)}h</div>
                              <div className="text-sm text-gray-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Allocation */}
            <TabsContent value="capacity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.capacityBreakdown.map((staff, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{staff.staffName}</div>
                            <div className="text-sm text-gray-500">
                              {staff.scheduledHours.toFixed(0)}h scheduled of {staff.availableHours.toFixed(0)}h available
                            </div>
                          </div>
                          <Badge 
                            variant={staff.utilizationPercent > 100 ? 'destructive' : 
                                   staff.utilizationPercent > 80 ? 'warning' : 'success'}
                          >
                            {staff.utilizationPercent.toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Utilization</span>
                            <span>{staff.utilizationPercent.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={Math.min(staff.utilizationPercent, 100)} 
                            className="h-2"
                          />
                          {staff.utilizationPercent > 100 && (
                            <div className="text-xs text-red-600">
                              Overallocated by {(staff.utilizationPercent - 100).toFixed(1)}%
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Available:</span>
                            <span className="ml-2 font-medium">{staff.availableHours.toFixed(0)}h</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Scheduled:</span>
                            <span className="ml-2 font-medium">{staff.scheduledHours.toFixed(0)}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Insights and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {utilizationPercent > 120 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">Critical Overallocation</div>
                    <div className="text-sm text-red-700">
                      This skill is critically overallocated. Consider immediate action to redistribute workload or add capacity.
                    </div>
                  </div>
                )}
                
                {utilizationPercent < 60 && totalCapacity > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Underutilization Opportunity</div>
                    <div className="text-sm text-blue-700">
                      This skill has significant available capacity. Consider taking on additional work or reallocating resources.
                    </div>
                  </div>
                )}

                {Math.abs(data.trends.demandTrend) > 10 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="font-medium text-amber-800">Demand Trend Alert</div>
                    <div className="text-sm text-amber-700">
                      Demand is {data.trends.demandTrend > 0 ? 'increasing' : 'decreasing'} significantly ({Math.abs(data.trends.demandTrend).toFixed(1)}%). 
                      Consider capacity planning adjustments.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownDialog;
