
import React, { useState, useEffect } from "react";
import { getUnscheduledTaskInstances } from "@/services/taskService";
import { TaskInstance } from "@/types/task";
import { DraggableTaskItem } from "./DraggableTaskItem";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Magic, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface UnscheduledTaskListProps {
  onTaskSelect: (task: TaskInstance) => void;
  tasksWithRecommendations?: string[]; // IDs of tasks that have recommendations
}

const UnscheduledTaskList: React.FC<UnscheduledTaskListProps> = ({ 
  onTaskSelect,
  tasksWithRecommendations = []
}) => {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const unscheduledTasks = await getUnscheduledTaskInstances();
        setTasks(unscheduledTasks);
      } catch (error) {
        console.error("Error loading unscheduled tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Filter tasks based on search query and priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Function to get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "destructive";
      case "High":
        return "default";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label htmlFor="priority-filter" className="sr-only">Filter by priority</Label>
          <Select 
            value={priorityFilter} 
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger id="priority-filter" className="w-full sm:w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2 p-2">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks match your filters. Try adjusting your search criteria.
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="relative border rounded-md hover:bg-slate-50 transition-colors"
              >
                <DraggableTaskItem task={task} onClick={() => onTaskSelect(task)}>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">{task.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {task.estimatedHours} hours • Due: {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {tasksWithRecommendations.includes(task.id) && (
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-transparent flex gap-1 items-center">
                            <Magic className="h-3 w-3" /> 
                            Recommended
                          </Badge>
                        )}
                        <Badge variant={getPriorityBadge(task.priority) as any}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {task.requiredSkills && task.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </DraggableTaskItem>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default UnscheduledTaskList;
