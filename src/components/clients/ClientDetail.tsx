import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientById, getClientRecurringTasks, getClientAdHocTasks, deleteClient } from '@/services/clientService';
import { Client } from '@/types/client';
import ClientRecurringTaskList from './ClientRecurringTaskList';
import ClientAdHocTaskList from './ClientAdHocTaskList';
import { 
  Building,
  CalendarClock,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Clock,
  Edit,
  Trash2,
  AlertTriangle,
  FileCheck,
  FileCog,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffLiaison, setStaffLiaison] = useState<{ full_name: string } | null>(null);
  
  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });

  // Fetch staff liaison details if staffLiaisonId exists
  useEffect(() => {
    const fetchStaffLiaison = async () => {
      if (client?.staffLiaisonId) {
        try {
          const { data, error } = await supabase
            .from('staff')
            .select('full_name')
            .eq('id', client.staffLiaisonId)
            .single();
          
          if (error) {
            console.error('Error fetching staff liaison:', error);
            return;
          }
          
          setStaffLiaison(data);
        } catch (error) {
          console.error('Error fetching staff liaison:', error);
        }
      }
    };
    
    fetchStaffLiaison();
  }, [client?.staffLiaisonId]);
  
  const handleDelete = async () => {
    try {
      if (id) {
        await deleteClient(id);
        toast({
          title: "Client deleted",
          description: "Client has been successfully deleted.",
        });
        navigate('/clients');
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    let color = "";
    switch (status) {
      case "Active":
        color = "bg-green-500";
        break;
      case "Inactive":
        color = "bg-gray-500";
        break;
      case "Pending":
        color = "bg-yellow-500";
        break;
      case "Archived":
        color = "bg-red-500";
        break;
    }
    
    return <Badge className={color}>{status}</Badge>;
  };
  
  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading client data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <AlertTriangle className="h-10 w-10 text-red-500 mr-4" />
            <p>Failed to load client details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!client) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{client.legalName}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Building className="h-4 w-4" />
            {client.industry}
            {getStatusBadge(client.status)}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/clients/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </Link>
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the client and remove all of its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Primary Contact</p>
                <p>{client.primaryContact}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Phone</p>
                <p>{client.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Billing Address</p>
                <p className="whitespace-pre-line">{client.billingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Monthly Revenue</p>
                <p>${client.expectedMonthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Payment Terms</p>
                <p>{client.paymentTerms}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Billing Frequency</p>
                <p>{client.billingFrequency}</p>
              </div>
            </div>
            
            {/* Staff Liaison - New */}
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Staff Liaison</p>
                {staffLiaison ? (
                  <p>{staffLiaison.full_name}</p>
                ) : (
                  <p className="text-muted-foreground italic">No liaison assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Engagement Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Email Reminders</p>
              <Badge variant={client.notificationPreferences.emailReminders ? "default" : "secondary"}>
                {client.notificationPreferences.emailReminders ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="font-medium">Task Notifications</p>
              <Badge variant={client.notificationPreferences.taskNotifications ? "default" : "secondary"}>
                {client.notificationPreferences.taskNotifications ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-start">
              <FileCog className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium">Default Task Priority</p>
                <p>{client.defaultTaskPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recurring" className="pt-4">
        <TabsList>
          <TabsTrigger value="recurring">
            <CalendarClock className="h-4 w-4 mr-2" />
            Recurring Tasks
          </TabsTrigger>
          <TabsTrigger value="adhoc">
            <FileCheck className="h-4 w-4 mr-2" />
            Ad-Hoc Tasks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recurring">
          <ClientRecurringTaskList clientId={id} />
        </TabsContent>
        <TabsContent value="adhoc">
          <ClientAdHocTaskList clientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
