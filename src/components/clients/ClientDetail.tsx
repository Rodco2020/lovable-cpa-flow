
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Client } from '@/types/client';
import { getClientById, getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
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
  FileText 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { format } from 'date-fns';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch client data
  const client = id ? getClientById(id) : null;
  
  if (!client) {
    navigate('/clients');
    return null;
  }
  
  // Get client tasks
  const recurringTasks = getClientRecurringTasks(client.id);
  const adHocTasks = getClientAdHocTasks(client.id);
  
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
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
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
                <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
                <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              View and manage all task engagements for this client
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="recurring" className="space-y-4">
              {recurringTasks.length > 0 ? (
                <div className="rounded-md border">
                  <div className="p-4">
                    Recurring task list would be displayed here, pulling from the Task Module.
                    This client has {recurringTasks.length} recurring tasks.
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border rounded-md bg-muted/20">
                  <h3 className="font-medium">No Recurring Tasks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This client doesn't have any recurring tasks set up yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="adhoc" className="space-y-4">
              {adHocTasks.length > 0 ? (
                <div className="rounded-md border">
                  <div className="p-4">
                    Ad-hoc task list would be displayed here, pulling from the Task Module.
                    This client has {adHocTasks.length} ad-hoc tasks.
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border rounded-md bg-muted/20">
                  <h3 className="font-medium">No Ad-hoc Tasks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This client doesn't have any ad-hoc tasks assigned.
                  </p>
                </div>
              )}
            </TabsContent>
          </CardContent>
          
          <CardFooter>
            <Button onClick={() => navigate('/tasks/create')} className="ml-auto">
              Create New Task
            </Button>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
};

export default ClientDetail;
