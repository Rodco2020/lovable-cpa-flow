
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, ClientStatus, IndustryType } from '@/types/client';
import { getClients, deleteClient } from '@/services/clientService';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  PencilIcon, 
  Trash2, 
  Plus, 
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [industryFilter, setIndustryFilter] = useState<IndustryType | 'all'>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [unfilteredClients, setUnfilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  
  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        console.log("Debug - Starting to fetch clients");
        console.log("Debug - Current filters:", { 
          status: statusFilter !== 'all' ? [statusFilter] : undefined,
          industry: industryFilter !== 'all' ? [industryFilter] : undefined,
          filtersEnabled
        });
        
        // First fetch all clients with no filters for debugging
        const allClients = await getClients();
        console.log("Debug - All clients without filters:", allClients);
        setUnfilteredClients(allClients);
        
        // Now fetch with filters if enabled
        const filtersToApply = (filtersEnabled && (statusFilter !== 'all' || industryFilter !== 'all')) 
          ? {
              status: statusFilter !== 'all' ? [statusFilter] : undefined,
              industry: industryFilter !== 'all' ? [industryFilter] : undefined
            }
          : undefined;
        
        console.log("Debug - Filters to apply:", filtersToApply);
        const fetchedClients = await getClients(filtersToApply);
        console.log("Debug - Filtered clients result:", fetchedClients);
        
        setClients(fetchedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setFetchError("Failed to load clients");
        toast({
          title: "Error",
          description: "Failed to load clients.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [statusFilter, industryFilter, filtersEnabled, toast]);
  
  // Further filter by search term
  const filteredClients = clients.filter(client => 
    client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log("Debug - After search filter, clients:", filteredClients);
  
  // Handle client deletion
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
  };
  
  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteClient(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      toast({
        title: "Client deleted",
        description: `${clientToDelete.legalName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the client.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };
  
  const toggleFilters = () => {
    setFiltersEnabled(!filtersEnabled);
    if (filtersEnabled) {
      toast({
        title: "Filters disabled",
        description: "Showing all clients regardless of filter settings.",
      });
    } else {
      toast({
        title: "Filters enabled",
        description: "Applying selected filters to clients.",
      });
    }
  };
  
  // Status badge color mapping
  const getStatusBadge = (status: ClientStatus) => {
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>Manage your client relationships</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={toggleFilters}
                className={filtersEnabled ? "" : "bg-amber-100"}
              >
                {filtersEnabled ? "Disable Filters" : "Enable Filters"}
              </Button>
              <Button onClick={() => navigate('/clients/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as ClientStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={industryFilter} 
                onValueChange={(value) => setIndustryFilter(value as IndustryType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Financial Services">Financial Services</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Hospitality">Hospitality</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {fetchError && (
            <div className="bg-red-50 p-4 mb-4 rounded-md border border-red-200 text-red-800">
              <p className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                {fetchError}
              </p>
            </div>
          )}
          
          {unfilteredClients.length > 0 && filteredClients.length === 0 && (
            <Alert className="mb-4" variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No clients match your filters</AlertTitle>
              <AlertDescription>
                There are {unfilteredClients.length} client(s) in the database, but none match your current filters.
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setIndustryFilter('all');
                  }}
                  className="p-0 h-auto ml-2"
                >
                  Clear filters
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Monthly Revenue</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading clients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.legalName}</TableCell>
                      <TableCell>
                        <div>{client.primaryContact}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${client.expectedMonthlyRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}/edit`)}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(client)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm || statusFilter !== 'all' || industryFilter !== 'all' ? (
                        <div>
                          <p className="mb-2">No clients match your filters.</p>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setIndustryFilter('all');
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      ) : (
                        "No clients found."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {unfilteredClients.length > 0 && (
            <div className="mt-4 p-2 bg-slate-50 rounded-md text-sm text-slate-600">
              <p>Debug Info:</p>
              <p>Total clients in database: {unfilteredClients.length}</p>
              <p>Clients after status/industry filters: {clients.length}</p>
              <p>Clients after search filter: {filteredClients.length}</p>
              <p>Current filters: Status={statusFilter}, Industry={industryFilter}, Filters enabled={filtersEnabled ? "Yes" : "No"}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {clientToDelete?.legalName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientList;
