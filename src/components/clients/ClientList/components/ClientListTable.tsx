
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientListTableProps {
  clients: Client[];
  onViewClient: (clientId: string) => void;
}

export const ClientListTable: React.FC<ClientListTableProps> = ({
  clients,
  onViewClient
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Primary Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Staff Liaison</TableHead>
            <TableHead>Monthly Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.legalName}</TableCell>
              <TableCell>{client.primaryContact}</TableCell>
              <TableCell>{client.industry}</TableCell>
              <TableCell>
                <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>
                {client.staffLiaisonName ? (
                  <span className="text-sm">{client.staffLiaisonName}</span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No liaison assigned</span>
                )}
              </TableCell>
              <TableCell>${client.expectedMonthlyRevenue.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewClient(client.id)}
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
  );
};
