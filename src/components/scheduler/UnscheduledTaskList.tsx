
import React, { useState, useEffect } from "react";
import { getUnscheduledTaskInstances } from "@/services/taskService";
import { getAllClients } from "@/services/clientService";
import { TaskInstance } from "@/types/task";
import { Client } from "@/types/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useSkillNames } from "@/hooks/useSkillNames";
import DraggableTaskItem from "./DraggableTaskItem";

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

  useEffect(() => {
    fetchData();
  }, [toast]);

  // Helper function to get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.legalName : clientId;
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
        
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
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
            <DraggableTaskItem 
              key={task.id}
              task={task}
              getClientName={getClientName}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnscheduledTaskList;
