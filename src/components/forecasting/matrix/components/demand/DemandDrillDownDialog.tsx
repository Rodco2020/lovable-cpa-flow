
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Clock,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { SkillType } from '@/types/task';
import { DemandDrillDownData } from '@/types/demandDrillDown';

interface DemandDrillDownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillType | null;
  month: string | null;
  data: DemandDrillDownData | null;
}

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
    if (trend > 2) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend < -2) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 2) return 'text-green-600';
    if (trend < -2) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Demand Details: {skill} - {data.monthLabel}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Hours</span>
                  </div>
                  <div className="text-2xl font-bold">{data.totalDemandHours.toFixed(1)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Tasks</span>
                  </div>
                  <div className="text-2xl font-bold">{data.taskCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Clients</span>
                  </div>
                  <div className="text-2xl font-bold">{data.clientCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(data.trends.demandTrend)}
                    <span className="text-sm font-medium">Trend</span>
                  </div>
                  <div className={`text-2xl font-bold ${getTrendColor(data.trends.demandTrend)}`}>
                    {data.trends.demandTrend > 0 ? '+' : ''}{data.trends.demandTrend.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Client Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.clientBreakdown.slice(0, 10).map((client, index) => (
                    <div key={client.clientId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{client.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.taskCount} tasks • Avg: {client.averageTaskSize.toFixed(1)}h per task
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{client.demandHours.toFixed(1)}h</div>
                        <div className="text-xs text-muted-foreground">
                          {client.recurringTasks}R + {client.adhocTasks}A
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.clientBreakdown.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... and {data.clientBreakdown.length - 10} more clients
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recurrence Pattern Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recurrence Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recurrencePatternSummary.map((pattern, index) => (
                    <div key={pattern.pattern} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{pattern.pattern}</span>
                        <Badge variant="secondary">{pattern.percentage.toFixed(1)}%</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pattern.taskCount} tasks • {pattern.totalHours.toFixed(1)} hours
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Top Tasks by Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.taskBreakdown.slice(0, 8).map((task, index) => (
                    <div key={task.taskId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{task.taskName}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.clientName} • {task.recurrenceType}
                          {task.isRecurring && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{task.monthlyHours.toFixed(1)}h</div>
                        <div className="text-xs text-muted-foreground">
                          Est: {task.estimatedHours.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trends Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(data.trends.demandTrend)}
                    <span className="text-sm font-medium">Demand Trend</span>
                  </div>
                  <div className={`text-lg font-bold ${getTrendColor(data.trends.demandTrend)}`}>
                    {data.trends.demandTrend > 0 ? '+' : ''}{data.trends.demandTrend.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">vs. previous month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(data.trends.taskGrowth)}
                    <span className="text-sm font-medium">Task Growth</span>
                  </div>
                  <div className={`text-lg font-bold ${getTrendColor(data.trends.taskGrowth)}`}>
                    {data.trends.taskGrowth > 0 ? '+' : ''}{data.trends.taskGrowth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">new tasks</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(data.trends.clientGrowth)}
                    <span className="text-sm font-medium">Client Growth</span>
                  </div>
                  <div className={`text-lg font-bold ${getTrendColor(data.trends.clientGrowth)}`}>
                    {data.trends.clientGrowth > 0 ? '+' : ''}{data.trends.clientGrowth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">client base</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
