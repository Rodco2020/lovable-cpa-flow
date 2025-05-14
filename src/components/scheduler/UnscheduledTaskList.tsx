
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnscheduledTaskInstances } from "@/services/taskService";
import { getAllSkills } from "@/services/skillService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskInstance } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";

interface UnscheduledTaskListProps {
  onTaskSelect: (task: TaskInstance) => void;
}

const UnscheduledTaskList: React.FC<UnscheduledTaskListProps> = ({ onTaskSelect }) => {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["unscheduledTasks"],
    queryFn: getUnscheduledTaskInstances,
  });

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => getAllSkills(),
  });

  // Filter tasks based on search input and skill filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = search === "" || 
      task.name.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesSkill = skillFilter === "" || 
      task.requiredSkills.includes(skillFilter as any);
    
    return matchesSearch && matchesSkill;
  });

  if (tasksLoading || skillsLoading) {
    return <div className="flex justify-center p-4">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search tasks..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Skills</SelectItem>
              {skills.map(skill => (
                <SelectItem key={skill.id} value={skill.name}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Required Skills</TableHead>
              <TableHead>Est. Hours</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No unscheduled tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.clientId}</TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No due date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{task.estimatedHours}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      task.priority === "High" || task.priority === "Urgent"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTaskSelect(task)}
                    >
                      Schedule
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UnscheduledTaskList;
