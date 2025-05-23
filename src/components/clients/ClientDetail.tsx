
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@/types/client';
import { getClientById, deleteClient } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ClientAdHocTaskList from './ClientAdHocTaskList';
import ClientRecurringTaskList from './ClientRecurringTaskList';
import CopyClientTasksDialog from './CopyClientTasksDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchClient = async () => {
      if (id) {
        try {
          const clientData = await getClientById(id);
          setClient(clientData);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load client details.",
            variant: "destructive"
          });
          navigate('/clients');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchClient();
  }, [id, navigate, toast]);
  
  const refreshClient = async () => {
    if (id) {
      setIsLoading(true);
      try {
        const clientData = await getClientById(id);
        setClient(clientData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to refresh client details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleDelete = async () => {
    if (id) {
      try {
        await deleteClient(id);
        toast({
          title: "Client deleted",
          description: "Client has been successfully deleted.",
        });
        navigate('/clients');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete client.",
          variant: "destructive"
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading client details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!client) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Client not found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
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
            <CardTitle>{client.legalName}</CardTitle>
          </div>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/clients/${client.id}/edit`)}
              className="mr-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Client
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the client and all related data.
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
        <CardDescription>
          View client details and manage related tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Primary Contact:</strong> {client.primaryContact}
            </div>
            <div>
              <strong>Email:</strong> {client.email}
            </div>
            <div>
              <strong>Phone:</strong> {client.phone}
            </div>
            <div>
              <strong>Billing Address:</strong> {client.billingAddress}
            </div>
            <div>
              <strong>Industry:</strong> {client.industry}
            </div>
            <div>
              <strong>Status:</strong> {client.status}
            </div>
            <div>
              <strong>Expected Monthly Revenue:</strong> ${client.expectedMonthlyRevenue.toLocaleString()}
            </div>
            <div>
              <strong>Payment Terms:</strong> {client.paymentTerms}
            </div>
            <div>
              <strong>Billing Frequency:</strong> {client.billingFrequency}
            </div>
            <div>
              <strong>Default Task Priority:</strong> {client.defaultTaskPriority}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Client Tasks</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCopyDialogOpen(true)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Tasks
            </Button>
          </div>

          <Tabs defaultValue="adhoc" className="space-y-4">
            <TabsList>
              <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adhoc">
              <ClientAdHocTaskList 
                clientId={client.id} 
                onTasksChanged={refreshClient} 
              />
            </TabsContent>
            
            <TabsContent value="recurring">
              <ClientRecurringTaskList 
                clientId={client.id}
                onRefreshNeeded={refreshClient}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      {isCopyDialogOpen && (
        <CopyClientTasksDialog 
          isOpen={isCopyDialogOpen}
          onClose={() => setIsCopyDialogOpen(false)}
          sourceClientId={client.id}
          sourceClientName={client.legalName}
        />
      )}
    </Card>
  );
};

export default ClientDetail;
