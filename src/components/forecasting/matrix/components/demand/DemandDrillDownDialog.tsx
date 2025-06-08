
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
  Briefcase,
  Repeat,
  Calendar
} from 'lucide-react';
import { DemandDrillDownData } from '@/types/demandDrillDown';
import { SkillType } from '@/types/task';

interface DemandDrillDownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillType | null;
  month: string | null;
  data: DemandDrillDownData | null;
}

/**
 * Demand-specific drill-down dialog with detailed breakdowns
 */
export const DemandDrillDownDialog: React.FC<DemandDrillDownDialogProps> = ({
  isOpen,
  onClose,
  skill,
  month,
  data
}) => {
  if (!data || !skill || !month) {
    return null;
  }

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
            Demand Analysis: {skill} - {data.monthLabel}
            <Badge variant="outline">
              {data.totalDemandHours.toFixed(0)}h total demand
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
                  <span className="text-sm font-medium">Total Demand</span>
                </div>
                <div className="text-2xl font-bold">{data.totalDemandHours.toFixed(0)}h</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.demandTrend)}`}>
                  {getTrendIcon(data.trends.demandTrend)}
                  {data.trends.demandTrend.toFixed(1)}% trend
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <div className="text-2xl font-bold">{data.taskCount}</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.taskGrowth)}`}>
                  {getTrendIcon(data.trends.taskGrowth)}
                  {data.trends.taskGrowth.toFixed(1)}% growth
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Clients</span>
                </div>
                <div className="text-2xl font-bold">{data.clientCount}</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.clientGrowth)}`}>
                  {getTrendIcon(data.trends.clientGrowth)}
                  {data.trends.clientGrowth.toFixed(1)}% growth
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Avg Task Size</span>
                </div>
                <div className="text-2xl font-bold">
                  {data.taskCount > 0 ? (data.totalDemandHours / data.taskCount).toFixed(1) : '0'}h
                </div>
                <div className="text-xs text-gray-500">
                  per task
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdowns */}
          <Tabs defaultValue="clients" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clients">Client Breakdown</TabsTrigger>
              <TabsTrigger value="tasks">Task Details</TabsTrigger>
              <TabsTrigger value="patterns">Recurrence Patterns</TabsTrigger>
            </TabsList>

            {/* Client Breakdown */}
            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Demand Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.clientBreakdown.map((client, index) => {
                      const percentage = data.totalDemandHours > 0 ? (client.demandHours / data.totalDemandHours) * 100 : 0;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{client.clientName}</div>
                              <div className="text-sm text-gray-500">
                                {client.taskCount} tasks ({client.recurringTasks} recurring, {client.adhocTasks} ad-hoc)
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{client.demandHours.toFixed(0)}h</div>
                              <div className="text-sm text-gray-500">
                                {percentage.toFixed(1)}% • {client.averageTaskSize.toFixed(1)}h avg
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

            {/* Task Details */}
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Individual Task Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {data.taskBreakdown.map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{task.taskName}</div>
                            <div className="text-sm text-gray-500">
                              {task.clientName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{task.monthlyHours.toFixed(1)}h</div>
                            <Badge variant={task.isRecurring ? 'default' : 'secondary'} className="text-xs">
                              {task.isRecurring ? 'Recurring' : 'Ad-hoc'}
                            </Badge>
                          </div>
                        </div>
                        
                        {task.isRecurring && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Repeat className="h-3 w-3" />
                            <span>{task.recurrenceType}</span>
                            <span>•</span>
                            <span>{task.recurrenceFrequency}x per period</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recurrence Patterns */}
            <TabsContent value="patterns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recurrence Pattern Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recurrencePatternSummary.map((pattern, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{pattern.pattern}</div>
                            <div className="text-sm text-gray-500">
                              {pattern.taskCount} tasks
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{pattern.totalHours.toFixed(0)}h</div>
                            <div className="text-sm text-gray-500">
                              {pattern.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={pattern.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.trends.demandTrend > 10 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Growing Demand</div>
                    <div className="text-sm text-blue-700">
                      Demand for {skill} is increasing significantly ({data.trends.demandTrend.toFixed(1)}%). 
                      Consider capacity planning adjustments.
                    </div>
                  </div>
                )}
                
                {data.clientCount === 1 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="font-medium text-amber-800">Single Client Dependency</div>
                    <div className="text-sm text-amber-700">
                      All demand comes from one client. Consider diversifying client base for this skill.
                    </div>
                  </div>
                )}

                {data.taskCount > 20 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">High Task Volume</div>
                    <div className="text-sm text-green-700">
                      This skill has {data.taskCount} tasks scheduled. Consider automation opportunities.
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

export default DemandDrillDownDialog;
