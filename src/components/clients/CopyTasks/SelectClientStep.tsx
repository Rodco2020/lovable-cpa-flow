
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Users, ArrowRight, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectClientStepProps } from './types';

export const SelectClientStep: React.FC<SelectClientStepProps> = ({
  sourceClientId,
  targetClientId,
  onSelectClient,
  availableClients,
  setSelectedClientId,
  isLoading,
  stepType = 'target'
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return availableClients;
    return availableClients.filter(client =>
      client.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableClients, searchTerm]);

  const selectedClientId = stepType === 'source' ? sourceClientId : targetClientId;
  const isTargetStep = stepType === 'target';

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    onSelectClient(clientId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isTargetStep ? <Target className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            <span>Select {isTargetStep ? 'Target' : 'Source'} Client</span>
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
            {isTargetStep ? <Target className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            <span>Select {isTargetStep ? 'Target' : 'Source'} Client</span>
            <Badge variant={isTargetStep ? "default" : "secondary"} className="ml-2">
              {isTargetStep ? 'TO' : 'FROM'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isTargetStep 
              ? 'Choose the client who will receive the copied tasks.'
              : 'Choose the client whose tasks you want to copy.'
            }
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
              <p>No clients available for selection.</p>
              {isTargetStep && (
                <p className="text-xs mt-1">The source client is automatically excluded.</p>
              )}
            </div>
          ) : (
            <RadioGroup value={selectedClientId} onValueChange={handleClientSelect}>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={client.id} id={`${stepType}-${client.id}`} />
                    <Label
                      htmlFor={`${stepType}-${client.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`p-3 transition-all hover:bg-accent ${
                        selectedClientId === client.id ? 'ring-2 ring-primary bg-accent' : ''
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{client.legalName}</h4>
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
          {selectedClientId && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Selected {isTargetStep ? 'Target' : 'Source'} Client: {
                    filteredClients.find(c => c.id === selectedClientId)?.legalName
                  }
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks will be copied {isTargetStep ? 'TO' : 'FROM'} this client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
