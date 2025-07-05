import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Users, Clock, TrendingUp, User, Calendar } from 'lucide-react';
import { useDetailMatrixState } from '../DetailMatrixStateProvider';

interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
}

interface SkillGroup {
  skillName: string;
  tasks: Task[];
  totalHours: number;
  clientCount: number;
  uniqueClients: string[];
}

interface SkillGroupViewProps {
  tasks: Task[];
  groupingMode: 'skill' | 'client';
  expandedGroups?: Set<string>;
  onToggleExpansion?: (skillName: string) => void;
}

/**
 * Skill Group View - Phase 2
 * 
 * Groups tasks by skill with expandable sections and client distribution summaries.
 * Provides enhanced visibility into skill-based workload distribution.
 */
export const SkillGroupView: React.FC<SkillGroupViewProps> = ({
  tasks,
  groupingMode
}) => {
  const { 
    expandedSkills, 
    toggleSkillExpansion,
    selectedTasks,
    toggleTaskSelection
  } = useDetailMatrixState();

  // Group tasks by skill
  const skillGroups: SkillGroup[] = useMemo(() => {
    const groupMap = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      const skill = task.skillRequired;
      if (!groupMap.has(skill)) {
        groupMap.set(skill, []);
      }
      groupMap.get(skill)!.push(task);
    });

    return Array.from(groupMap.entries()).map(([skillName, skillTasks]) => {
      const uniqueClients = [...new Set(skillTasks.map(task => task.clientName))];
      return {
        skillName,
        tasks: skillTasks,
        totalHours: skillTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
        clientCount: uniqueClients.length,
        uniqueClients
      };
    }).sort((a, b) => b.totalHours - a.totalHours); // Sort by total hours desc
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const totalHoursAcrossSkills = skillGroups.reduce((sum, group) => sum + group.totalHours, 0);

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Skills Overview</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline">
                {skillGroups.length} skills
              </Badge>
              <Badge variant="secondary">
                {totalHoursAcrossSkills.toFixed(1)}h total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tasks grouped by required skill with client distribution analysis. 
            Click on skill headers to expand and view individual tasks.
          </p>
        </CardContent>
      </Card>

      {/* Skill Groups */}
      {skillGroups.map((group) => {
        const isExpanded = expandedSkills.has(group.skillName);
        const selectedInGroup = group.tasks.filter(task => selectedTasks.has(task.id)).length;
        const hoursPercentage = totalHoursAcrossSkills > 0 
          ? (group.totalHours / totalHoursAcrossSkills * 100).toFixed(1)
          : '0';

        return (
          <Card key={group.skillName} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleSkillExpansion(group.skillName)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-semibold text-lg">{group.skillName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{group.totalHours.toFixed(1)}h ({hoursPercentage}%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{group.clientCount} clients</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{group.tasks.length} tasks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {selectedInGroup > 0 && (
                        <Badge variant="secondary">
                          {selectedInGroup} selected
                        </Badge>
                      )}
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${hoursPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Client Distribution Summary */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Client Distribution:</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.uniqueClients.map(client => {
                        const clientTaskCount = group.tasks.filter(task => task.clientName === client).length;
                        const clientHours = group.tasks
                          .filter(task => task.clientName === client)
                          .reduce((sum, task) => sum + task.monthlyHours, 0);
                        
                        return (
                          <Badge key={client} variant="outline" className="text-xs">
                            {client} ({clientTaskCount} tasks, {clientHours.toFixed(1)}h)
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2">
                    {group.tasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`p-3 border rounded-lg transition-colors ${
                          selectedTasks.has(task.id) ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedTasks.has(task.id)}
                              onCheckedChange={() => toggleTaskSelection(task.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{task.taskName}</div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.clientName}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.monthlyHours.toFixed(1)}h</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{task.monthLabel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="secondary">
                              {task.recurrencePattern}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {skillGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No skill groups found</h3>
              <p className="text-sm">
                Tasks will be grouped by skill when data is available.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};