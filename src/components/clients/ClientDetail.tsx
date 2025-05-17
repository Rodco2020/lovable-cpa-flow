
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Client } from '@/types/client';
import { getClientById, getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { RecurringTask, TaskInstance, TaskStatus } from '@/types/task';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PencilIcon, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  Clock
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

// Import the task list components
import ClientRecurringTaskList from './ClientRecurringTaskList';
import ClientAdHocTaskList from './ClientAdHocTaskList';
import EditRecurringTaskDialog from './EditRecurringTaskDialog';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for async data - updated types to match the actual data structures
  const [client, setClient] = useState<Client | null>(null);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [adHocTasks, setAdHocTasks] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Task analytics
  const [taskAnalytics, setTaskAnalytics] = useState({
    activeRecurringCount: 0,
    upcomingTasksCount: 0,
    pendingTasksCount: 0,
    completedTasksCount: 0
  });
  
  // State for edit task dialog - moved this up to ensure consistent hook order
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RecurringTask | null>(null);
  
  // Calculate task analytics
  useEffect(() => {
    if (recurringTasks.length || adHocTasks.length) {
      const activeRecurring = recurringTasks.filter(task => task.isActive).length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextTwoWeeks = new Date(today);
      nextTwoWeeks.setDate(today.getDate() + 14);
      
      const upcoming = adHocTasks.filter(task => 
        task.dueDate && task.dueDate >= today && task.dueDate <= nextTwoWeeks &&
        ['Unscheduled', 'Scheduled'].includes(task.status)
      ).length;
      
      const pending = adHocTasks.filter(task => 
        task.status === 'In Progress'
      ).length;
      
      const completed = adHocTasks.filter(task => 
        task.status === 'Completed'
      ).length;
      
      setTaskAnalytics({
        activeRecurringCount: activeRecurring,
        upcomingTasksCount: upcoming,
        pendingTasksCount: pending,
        completedTasksCount: completed
      });
    }
  }, [recurringTasks, adHocTasks]);
  
  // Fetch client data
  const fetchClientData = useCallback(async () => {
    if (!id) {
      navigate('/clients');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch client
      const clientData = await getClientById(id);
      if (!clientData) {
        toast({
          title: "Client not found",
          description: `Unable to find client with ID ${id}`,
          variant: "destructive"
        });
        navigate('/clients');
        return;
      }
      
      setClient(clientData);
      
      // Fetch tasks
      const [recurringTasksData, adHocTasksData] = await Promise.all([
        getClientRecurringTasks(clientData.id),
        getClientAdHocTasks(clientData.id)
      ]);
      
      setRecurringTasks(recurringTasksData);
      setAdHocTasks(adHocTasksData);
    } catch (error) {
      console.error("Error fetching client data:", error);
      setError("Failed to load client details. Please try again later.");
      
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);
  
  // Initial data fetch
  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);
  
  // Handle task view navigation
  const handleViewRecurringTask = (taskId: string) => {
    navigate(`/tasks/recurring/${taskId}`);
  };
  
  const handleViewAdHocTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Handle create task with client context
  const handleCreateTask = () => {
    if (client) {
      navigate('/tasks/create', { 
        state: { 
          clientId: client.id,
          clientName: client.legalName
        } 
      });
    }
  };

  // Handle edit task
  const handleEditTask = (task: RecurringTask) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };

  // Handle task updated
  const handleTaskUpdated = () => {
    // Refresh data to show the updated task
    fetchClientData();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading client details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/clients')}>
            Return to Clients
          </Button>
        </div>
      </div>
    );
  }
  
  // Client not loaded
  if (!client) {
    return null;
  }
  
  // Status badge color mapping
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case 'Archived':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format recurrence pattern for display
  const formatRecurrencePattern = (task: RecurringTask): string => {
    const pattern = task.recurrencePattern;
    switch (pattern.type) {
      case 'Daily':
        return `Daily${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} days)` : ''}`;
      case 'Weekly':
        if (pattern.weekdays && pattern.weekdays.length) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `Weekly on ${pattern.weekdays.map(d => days[d]).join(', ')}`;
        }
        return `Weekly${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} weeks)` : ''}`;
      case 'Monthly':
        return `Monthly on day ${pattern.dayOfMonth || 1}${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} months)` : ''}`;
      case 'Quarterly':
        return 'Quarterly';
      case 'Annually':
        return 'Annually';
      case 'Custom':
        return 'Custom schedule';
      default:
        return 'Unknown schedule';
    }
  };
  
  // Calculate active recurring tasks and tasks requiring attention
  const activeRecurringTasks = recurringTasks.filter(task => task.isActive);
  const tasksRequiringAttention = adHocTasks.filter(task => 
    (task.status === 'Unscheduled' || task.status === 'In Progress') && 
    task.dueDate && task.dueDate < new Date()
  );
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/clients')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{client.legalName}</h1>
          {getStatusBadge(client.status)}
        </div>
        <Button onClick={() => navigate(`/clients/${client.id}/edit`)}>
          <PencilIcon className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>
      
      {/* Task Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Recurring Tasks</p>
                <p className="text-2xl font-bold">{taskAnalytics.activeRecurringCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Tasks</p>
                <p className="text-2xl font-bold">{taskAnalytics.upcomingTasksCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{taskAnalytics.pendingTasksCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{taskAnalytics.completedTasksCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Client Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Primary Contact</div>
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                {client.primaryContact}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                  {client.email}
                </a>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone}
                </a>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Billing Address</div>
              <div className="flex">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                <span className="whitespace-pre-line">{client.billingAddress}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Industry</div>
              <div>
                {client.industry}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Client Since</div>
              <div>
                {format(client.createdAt, 'MMMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Financial Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Expected Monthly Revenue</div>
              <div className="text-2xl font-semibold">
                ${client.expectedMonthlyRevenue.toLocaleString()}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Payment Terms</div>
              <div>
                {client.paymentTerms}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Billing Frequency</div>
              <div>
                {client.billingFrequency}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Yearly Revenue Projection</div>
              <div className="text-xl font-medium">
                ${(client.expectedMonthlyRevenue * 12).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Based on current monthly revenue
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Engagement Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Engagement Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Default Task Priority</div>
              <div>
                <Badge variant={
                  client.defaultTaskPriority === "Low" ? "outline" :
                  client.defaultTaskPriority === "Medium" ? "secondary" :
                  client.defaultTaskPriority === "High" ? "default" :
                  "destructive"
                }>
                  {client.defaultTaskPriority}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Notification Preferences</div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${client.notificationPreferences.emailReminders ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={client.notificationPreferences.emailReminders ? '' : 'text-muted-foreground'}>
                    Email Reminders
                  </span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${client.notificationPreferences.taskNotifications ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={client.notificationPreferences.taskNotifications ? '' : 'text-muted-foreground'}>
                    Task Notifications
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div>
                {format(client.updatedAt, 'MMMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks & Engagements Tabs */}
      <Card>
        <Tabs defaultValue="recurring" className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Client Engagements
              </CardTitle>
              <TabsList>
                <TabsTrigger value="recurring" className="relative">
                  Recurring Tasks
                  <Badge variant="secondary" className="ml-2">
                    {recurringTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="adhoc" className="relative">
                  Ad-hoc Tasks
                  <Badge variant="secondary" className="ml-2">
                    {adHocTasks.length}
                  </Badge>
                  {tasksRequiringAttention.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              View and manage all task engagements for this client
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="recurring" className="space-y-4">
              <ClientRecurringTaskList 
                clientId={client.id} 
                onRefreshNeeded={fetchClientData}
                onViewTask={handleViewRecurringTask}
                onEditTask={handleEditTask}
              />
            </TabsContent>
            
            <TabsContent value="adhoc" className="space-y-4">
              <ClientAdHocTaskList 
                tasks={adHocTasks}
                onViewTask={handleViewAdHocTask}
              />
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className="text-sm text-muted-foreground">
              {client.status === 'Active' ? (
                <span>This client is active and can be assigned new tasks</span>
              ) : (
                <span>This client is {client.status.toLowerCase()} and may have restricted functionalities</span>
              )}
            </div>
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </Button>
          </CardFooter>
        </Tabs>
      </Card>
      
      {/* Edit Recurring Task Dialog */}
      <EditRecurringTaskDialog
        open={isEditTaskDialogOpen}
        task={selectedTask}
        onOpenChange={setIsEditTaskDialogOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default ClientDetail;
