
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectSourceClientStepProps } from './types';

export const SelectSourceClientStep: React.FC<SelectSourceClientStepProps> = ({
  onSelectSourceClient,
  availableClients,
  sourceClientId,
  setSourceClientId,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return availableClients;
    return availableClients.filter(client =>
      client.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableClients, searchTerm]);

  const handleClientSelect = (clientId: string) => {
    setSourceClientId(clientId);
    onSelectSourceClient(clientId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Select Source Client</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedClient = filteredClients.find(c => c.id === sourceClientId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Step 1: Select Source Client</span>
            <Badge variant="secondary" className="ml-2">
              FROM
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the client whose tasks you want to copy to another client.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client Selection */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No clients found matching your search criteria.</p>
            </div>
          ) : (
            <RadioGroup value={sourceClientId} onValueChange={handleClientSelect}>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={client.id} id={`source-${client.id}`} />
                    <Label
                      htmlFor={`source-${client.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`p-3 transition-all hover:bg-accent ${
                        sourceClientId === client.id ? 'ring-2 ring-primary bg-accent' : ''
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium flex items-center space-x-2">
                              <span>{client.legalName}</span>
                              {sourceClientId === client.id && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {client.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Industry: {client.industry}</span>
                            {client.expectedMonthlyRevenue && (
                              <span>Revenue: ${client.expectedMonthlyRevenue}</span>
                            )}
                          </div>
                          
                          {client.primaryContact && (
                            <p className="text-sm text-muted-foreground">
                              Contact: {client.primaryContact}
                            </p>
                          )}
                        </div>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Selection Summary */}
          {selectedClient && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Selected Source Client: {selectedClient.legalName}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Tasks will be copied FROM this client to your target client.
              </p>
            </div>
          )}

          {/* Step Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h4>
            <ol className="text-xs text-blue-600 space-y-1">
              <li>1. Select your source client above</li>
              <li>2. Choose the target client to copy tasks to</li>
              <li>3. Select which tasks to copy</li>
              <li>4. Review and confirm the operation</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
