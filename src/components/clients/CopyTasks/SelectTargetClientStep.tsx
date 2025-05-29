
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Target, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Client } from '@/types/client';

interface SelectTargetClientStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  sourceClientName?: string;
}

export const SelectTargetClientStep: React.FC<SelectTargetClientStepProps> = ({
  sourceClientId,
  targetClientId,
  onSelectClient,
  availableClients,
  isLoading,
  sourceClientName
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
    if (clientId === sourceClientId) {
      return; // Prevent selecting same client
    }
    onSelectClient(clientId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Select Target Client</span>
            <Badge variant="default" className="ml-2">TO</Badge>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Select Target Client</span>
            <Badge variant="default" className="ml-2 bg-blue-500 text-white">TO</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the client who will receive the copied tasks from{' '}
            {sourceClientName && <strong>{sourceClientName}</strong>}.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Tasks will be copied <strong>TO</strong> the client you select here from your source client.
            </AlertDescription>
          </Alert>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search target clients by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client Selection */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No target clients available for selection.</p>
              <p className="text-xs mt-1">The source client is automatically excluded.</p>
            </div>
          ) : (
            <RadioGroup value={targetClientId || ''} onValueChange={handleClientSelect}>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.map((client) => {
                  const isSameAsSource = client.id === sourceClientId;
                  return (
                    <div key={client.id} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={client.id} 
                        id={`target-${client.id}`}
                        disabled={isSameAsSource}
                      />
                      <Label
                        htmlFor={`target-${client.id}`}
                        className={`flex-1 ${isSameAsSource ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <Card className={`p-3 transition-all ${
                          isSameAsSource 
                            ? 'bg-gray-100 border-gray-200 opacity-50' 
                            : targetClientId === client.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                            : 'hover:bg-accent'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium flex items-center space-x-2">
                                <span>{client.legalName}</span>
                                {isSameAsSource && (
                                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                    Source Client
                                  </Badge>
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
                  );
                })}
              </div>
            </RadioGroup>
          )}

          {/* Selection Summary */}
          {targetClientId && targetClientId !== sourceClientId && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Selected Target Client: {
                    filteredClients.find(c => c.id === targetClientId)?.legalName
                  }
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Tasks will be copied TO this client from your selected source client.
              </p>
            </div>
          )}

          {/* Same Client Warning */}
          {targetClientId === sourceClientId && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                You cannot copy tasks to the same client. Please select a different target client.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
