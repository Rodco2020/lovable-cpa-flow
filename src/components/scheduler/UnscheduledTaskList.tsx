
import React, { useState, useEffect } from "react";
import { getUnscheduledTaskInstances } from "@/services/taskService";
import { getAllClients } from "@/services/clientService";
import { TaskInstance } from "@/types/task";
import { Client } from "@/types/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSkillNames } from "@/hooks/useSkillNames";

interface UnscheduledTaskListProps {
  onTaskSelect?: (task: TaskInstance) => void;
}

const UnscheduledTaskList: React.FC<UnscheduledTaskListProps> = ({ onTaskSelect }) => {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();
  
  // Extract all skill IDs from all tasks for the useSkillNames hook
  const allSkillIds = tasks.flatMap(task => task.requiredSkills);
  const { skillsMap } = useSkillNames(allSkillIds);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [unscheduledTasks, clientsData] = await Promise.all([
          getUnscheduledTaskInstances(),
          getAllClients()
        ]);
        setTasks(unscheduledTasks);
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: "Could not retrieve unscheduled tasks or clients.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.legalName : clientId;
  };
  
  // Helper function to get skill name by ID
  const getSkillName = (skillId: string): string => {
    return skillsMap[skillId]?.name || skillId;
  };

  const handleTaskClick = (task: TaskInstance) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Fix for undefined properties: safely check if properties exist before using toLowerCase()
    const nameMatch = task.name && searchQuery ? 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) : 
      !searchQuery;
    
    const clientName = getClientName(task.clientId);
    const clientMatch = clientName && searchQuery ? 
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) : 
      !searchQuery;
    
    const matchesSearch = nameMatch || clientMatch;
    
    // Make sure to match the correct priority format from the TaskPriority type
    const matchesPriority = priorityFilter === "all" || 
      task.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={priorityFilter}
          onValueChange={setPriorityFilter}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span>{priorityFilter === "all" ? "All Priorities" : `${priorityFilter.charAt(0).toUpperCase()}${priorityFilter.slice(1)}`}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery || priorityFilter !== "all" ? 
            "No tasks match your search criteria" : 
            "No unscheduled tasks found"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex-1">
                <h4 className="font-medium">{task.name}</h4>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{getClientName(task.clientId)}</span>
                  <span>•</span>
                  <span>{task.estimatedHours} hours</span>
                </div>
                {task.requiredSkills && task.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {task.requiredSkills.map((skillId, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getSkillName(skillId)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 text-xs rounded-full ${
                  task.priority.toLowerCase() === "high" ? "bg-red-100 text-red-800" :
                  task.priority.toLowerCase() === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                </div>
                <Button variant="outline" size="sm">
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnscheduledTaskList;
