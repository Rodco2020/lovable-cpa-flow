
import React, { useState, useEffect } from 'react';
import { getUnscheduledTaskInstances } from '@/services/taskService';
import { getAllClients } from '@/services/clientService';
import { TaskInstance } from '@/types/task';
import { Client } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BriefcaseBusiness, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSkillNames } from '@/hooks/useSkillNames';

const UnscheduledTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract all skill IDs from all tasks for the useSkillNames hook
  const allSkillIds = tasks.flatMap(task => task.requiredSkills);
  const { skillsMap, isLoading: skillsLoading } = useSkillNames(allSkillIds);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const unscheduledTasks = await getUnscheduledTaskInstances();
      setTasks(unscheduledTasks);
      
      // Fetch clients to display names instead of IDs
      const clientsData = await getAllClients();
      setClients(clientsData);
      
      // Show success toast only if refreshing, not on initial load
      if (!loading) {
        toast.success("Tasks refreshed successfully");
      }
    } catch (error) {
      console.error('Error fetching unscheduled tasks:', error);
      setError("Failed to load unscheduled tasks. Please try again.");
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper function to get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.legalName : clientId;
  };
  
  // Helper function to get skill name by ID
  const getSkillName = (skillId: string): string => {
    return skillsMap[skillId]?.name || skillId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" /> 
            Unscheduled Tasks
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No unscheduled tasks found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <BriefcaseBusiness className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      {getClientName(task.clientId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                  </TableCell>
                  <TableCell>{task.estimatedHours}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.requiredSkills && task.requiredSkills.length > 0 ? (
                        task.requiredSkills.map((skillId, index) => (
                          <Badge variant="outline" key={index}>
                            {skillsLoading ? '...' : getSkillName(skillId)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No skills required</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UnscheduledTaskList;
