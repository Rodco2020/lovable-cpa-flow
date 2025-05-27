
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientSelectionScreenProps {
  clientsList: Array<{ id: string; legalName: string }> | undefined;
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
}

export const ClientSelectionScreen: React.FC<ClientSelectionScreenProps> = ({
  clientsList,
  selectedClientId,
  onClientSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Detail Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive reports for individual clients
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>
            Choose a client to generate their detailed report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedClientId} onValueChange={onClientSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent>
              {clientsList?.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.legalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};
