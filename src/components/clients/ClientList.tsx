import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building, Eye, Loader2, PlusCircle, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExportButton } from '@/components/export';
import { ExportService, ExportOptions, ClientExportData } from '@/services/export/exportService';
import { PrintView } from '@/components/export/PrintView';
import { Client } from '@/types/client';
import { toast } from 'sonner';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintView, setShowPrintView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getAllClients(),
  });

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => 
    client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Convert clients to export format
  const exportData: ClientExportData[] = filteredClients.map(client => ({
    id: client.id,
    legalName: client.legalName,
    primaryContact: client.primaryContact,
    email: client.email,
    phone: client.phone,
    industry: client.industry,
    status: client.status,
    expectedMonthlyRevenue: client.expectedMonthlyRevenue,
    staffLiaisonName: undefined // Will be populated by the service if needed
  }));

  // Get applied filters for export
  const getAppliedFilters = () => {
    const filters: Record<string, any> = {};
    if (searchTerm) {
      filters['Search Term'] = searchTerm;
    }
    return filters;
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      const appliedFilters = options.includeFilters ? getAppliedFilters() : undefined;
      
      await ExportService.exportClients(exportData, options, appliedFilters);
      
      toast.success(`Client directory exported successfully as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export client directory. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const handlePrintExecute = () => {
    window.print();
    setShowPrintView(false);
  };
  
  if (showPrintView) {
    return (
      <PrintView
        title="Client Directory"
        data={exportData}
        dataType="clients"
        appliedFilters={getAppliedFilters()}
        onPrint={handlePrintExecute}
      />
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading clients</p>
        <Button onClick={() => navigate(0)}>Retry</Button>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Client Directory</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <ExportButton
              onExport={handleExport}
              dataType="clients"
              isLoading={isExporting}
              disabled={exportData.length === 0}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="text-sm text-muted-foreground">
              {filteredClients.length} of {clients?.length || 0} clients
            </div>
          </div>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-lg font-semibold">No clients found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {clients?.length ? 'Try adjusting your search.' : 'Get started by adding your first client.'}
              </p>
              <Button onClick={() => navigate('/clients/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Primary Contact</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.legalName}</TableCell>
                      <TableCell>{client.primaryContact}</TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${client.expectedMonthlyRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientList;
