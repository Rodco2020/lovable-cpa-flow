
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client, ClientStatus, IndustryType } from '@/types/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Building, DollarSign, Search, User, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ClientStatus[]>([]);
  const [industryFilter, setIndustryFilter] = useState<IndustryType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [staffLiaisons, setStaffLiaisons] = useState<Record<string, string>>({});
  
  // Fetch clients with filters
  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients', statusFilter, industryFilter],
    queryFn: () => getAllClients({ 
      status: statusFilter.length > 0 ? statusFilter : undefined,
      industry: industryFilter.length > 0 ? industryFilter : undefined,
    }),
  });

  // Handler for clicking on a client row
  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  // Effect to refetch data when returning to this page
  useEffect(() => {
    const refreshData = async () => {
      // Clear staff liaisons to ensure fresh data is fetched
      setStaffLiaisons({});
      // Invalidate and refetch client data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      refetch();
    };
    
    // Check if we're returning from an edit page
    if (location.key) {
      refreshData();
    }
  }, [location.key, queryClient, refetch]);

  // Fetch staff liaisons for all clients that have them assigned
  useEffect(() => {
    const fetchStaffLiaisons = async () => {
      const clientsWithLiaisons = clients.filter(client => client.staffLiaisonId);
      if (clientsWithLiaisons.length === 0) return;
      
      const liaisonIds = clientsWithLiaisons.map(client => client.staffLiaisonId).filter(Boolean);
      
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('id, full_name')
          .in('id', liaisonIds);
          
        if (error) {
          console.error('Error fetching staff liaisons:', error);
          return;
        }
        
        const liaisonMap: Record<string, string> = {};
        data.forEach(staff => {
          liaisonMap[staff.id] = staff.full_name;
        });
        
        setStaffLiaisons(liaisonMap);
      } catch (error) {
        console.error('Error fetching staff liaisons:', error);
      }
    };
    
    if (clients.length > 0) {
      fetchStaffLiaisons();
    }
  }, [clients]);
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setStatusFilter([]);
    } else {
      setStatusFilter([value as ClientStatus]);
    }
  };
  
  // Handle industry filter change
  const handleIndustryFilterChange = (value: string) => {
    if (value === "all") {
      setIndustryFilter([]);
    } else {
      setIndustryFilter([value as IndustryType]);
    }
  };
  
  // Filter clients by search query
  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      client.legalName.toLowerCase().includes(search) ||
      client.primaryContact.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });
  
  // Render status badge with appropriate color
  const getStatusBadge = (status: ClientStatus) => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Directory</CardTitle>
        <CardDescription>Manage your client relationships</CardDescription>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select onValueChange={handleStatusFilterChange} defaultValue="all">
              <SelectTrigger className="w-[160px]">
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
            
            <Select onValueChange={handleIndustryFilterChange} defaultValue="all">
              <SelectTrigger className="w-[160px]">
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead className="hidden md:table-cell">Industry</TableHead>
                <TableHead className="hidden md:table-cell">Staff Liaison</TableHead>
                <TableHead className="hidden md:table-cell">Monthly Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No clients found. {searchQuery ? "Try a different search term." : ""}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <TableCell>
                      <span className="font-medium text-blue-600">{client.legalName}</span>
                    </TableCell>
                    <TableCell>{client.primaryContact}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-gray-500" />
                        {client.industry}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.staffLiaisonId ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-500" />
                          {staffLiaisons[client.staffLiaisonId] || 'Loading...'}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        {client.expectedMonthlyRevenue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          navigate(`/clients/${client.id}/edit`);
                        }}
                        title="Edit client"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientList;
