
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  UserCheck,
  AlertCircle
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
 * Enhanced Demand Drill-Down Dialog with Preferred Staff Information
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

  // Calculate enhanced metrics including preferred staff
  const totalDemandHours = data.totalDemandHours;
  const tasksWithPreferredStaff = data.taskBreakdown.filter(task => task.preferredStaffId).length;
  const tasksWithoutPreferredStaff = data.taskBreakdown.length - tasksWithPreferredStaff;
  const preferredStaffCoverage = data.taskBreakdown.length > 0 ? (tasksWithPreferredStaff / data.taskBreakdown.length) * 100 : 0;

  // Group tasks by preferred staff
  const tasksByPreferredStaff = data.taskBreakdown.reduce((acc, task) => {
    const staffKey = task.preferredStaffId || 'unassigned';
    const staffName = task.preferredStaffName || 'No Preferred Staff';
    
    if (!acc[staffKey]) {
      acc[staffKey] = {
        staffId: staffKey,
        staffName: staffName,
        tasks: [],
        totalHours: 0,
        taskCount: 0
      };
    }
    
    acc[staffKey].tasks.push(task);
    acc[staffKey].totalHours += task.monthlyHours;
    acc[staffKey].taskCount += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const preferredStaffGroups = Object.values(tasksByPreferredStaff).sort((a: any, b: any) => b.totalHours - a.totalHours);

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Demand Analysis: {skill} - {data.monthLabel}
            <Badge variant="outline" className="ml-2">
              {totalDemandHours.toFixed(0)}h total demand
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown including preferred staff assignments and task analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Demand</span>
                </div>
                <div className="text-2xl font-bold">{totalDemandHours.toFixed(0)}h</div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.demandTrend)}`}>
                  {getTrendIcon(data.trends.demandTrend)}
                  {data.trends.demandTrend.toFixed(1)}% trend
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <div className="text-2xl font-bold">{data.taskCount}</div>
                <div className="text-xs text-gray-500">
                  {data.clientCount} clients
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">With Staff</span>
                </div>
                <div className="text-2xl font-bold">{tasksWithPreferredStaff}</div>
                <div className="text-xs text-gray-500">
                  {preferredStaffCoverage.toFixed(0)}% coverage
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Unassigned</span>
                </div>
                <div className="text-2xl font-bold">{tasksWithoutPreferredStaff}</div>
                <div className="text-xs text-gray-500">
                  {(100 - preferredStaffCoverage).toFixed(0)}% unassigned
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Growth</span>
                </div>
                <div className={`text-2xl font-bold ${getTrendColor(data.trends.taskGrowth)}`}>
                  {data.trends.taskGrowth > 0 ? '+' : ''}{data.trends.taskGrowth.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">
                  task growth
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdowns with Preferred Staff */}
          <Tabs defaultValue="staff" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="staff">Preferred Staff</TabsTrigger>
              <TabsTrigger value="clients">Client Breakdown</TabsTrigger>
              <TabsTrigger value="tasks">Task Details</TabsTrigger>
              <TabsTrigger value="patterns">Recurrence Patterns</TabsTrigger>
            </TabsList>

            {/* NEW: Preferred Staff Breakdown */}
            <TabsContent value="staff" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Preferred Staff Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {preferredStaffGroups.map((staffGroup: any, index) => {
                      const percentage = totalDemandHours > 0 ? (staffGroup.totalHours / totalDemandHours) * 100 : 0;
                      const isUnassigned = staffGroup.staffId === 'unassigned';
                      
                      return (
                        <div key={index} className="space-y-3 p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {isUnassigned ? (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                                <span className="font-medium">{staffGroup.staffName}</span>
                                {isUnassigned && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                                    Needs Assignment
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {staffGroup.taskCount} tasks • {staffGroup.totalHours.toFixed(0)} hours
                              </div>
                            </div>
                            <Badge variant={isUnassigned ? 'secondary' : 'default'}>
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                          
                          <Progress value={percentage} className="h-2" />
                          
                          {/* Task list for this staff member */}
                          <div className="ml-6 space-y-1">
                            {staffGroup.tasks.slice(0, 3).map((task: any, taskIndex: number) => (
                              <div key={taskIndex} className="text-xs text-gray-600 flex justify-between">
                                <span>{task.taskName} ({task.clientName})</span>
                                <span>{task.monthlyHours.toFixed(0)}h</span>
                              </div>
                            ))}
                            {staffGroup.tasks.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{staffGroup.tasks.length - 3} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Breakdown */}
            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Client Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.clientBreakdown.map((client, index) => {
                      const percentage = totalDemandHours > 0 ? (client.demandHours / totalDemandHours) * 100 : 0;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{client.clientName}</div>
                              <div className="text-sm text-gray-500">
                                {client.taskCount} tasks • Avg: {client.averageTaskSize.toFixed(1)}h per task
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{client.demandHours.toFixed(0)}h</div>
                              <div className="text-sm text-gray-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>Recurring: {client.recurringTasks}</span>
                            <span>Ad-hoc: {client.adhocTasks}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Task Details */}
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Task Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.taskBreakdown.map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{task.taskName}</div>
                            <div className="text-sm text-gray-500">
                              {task.clientName} • {task.recurrenceType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{task.monthlyHours.toFixed(0)}h</div>
                            <div className="text-sm text-gray-500">
                              Est: {task.estimatedHours.toFixed(0)}h
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced with preferred staff info */}
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            {task.preferredStaffId ? (
                              <>
                                <UserCheck className="h-3 w-3 text-green-500" />
                                <span className="text-green-700">
                                  Preferred: {task.preferredStaffName}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                <span className="text-orange-700">No preferred staff</span>
                              </>
                            )}
                          </div>
                          <Badge variant={task.isRecurring ? 'default' : 'secondary'} className="text-xs">
                            {task.isRecurring ? 'Recurring' : 'Ad-hoc'}
                          </Badge>
                        </div>
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
                    <Activity className="h-5 w-5" />
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

          {/* Enhanced Insights and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preferredStaffCoverage < 50 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800">Low Preferred Staff Coverage</div>
                    <div className="text-sm text-orange-700">
                      Only {preferredStaffCoverage.toFixed(0)}% of tasks have preferred staff assigned. Consider assigning preferred staff to improve scheduling efficiency.
                    </div>
                  </div>
                )}
                
                {tasksWithoutPreferredStaff > 5 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Staff Assignment Opportunity</div>
                    <div className="text-sm text-blue-700">
                      {tasksWithoutPreferredStaff} tasks don't have preferred staff assigned. This could impact scheduling and resource allocation.
                    </div>
                  </div>
                )}

                {Math.abs(data.trends.demandTrend) > 10 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="font-medium text-amber-800">Demand Trend Alert</div>
                    <div className="text-sm text-amber-700">
                      Demand is {data.trends.demandTrend > 0 ? 'increasing' : 'decreasing'} significantly ({Math.abs(data.trends.demandTrend).toFixed(1)}%). 
                      Consider capacity planning adjustments and preferred staff assignments.
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
