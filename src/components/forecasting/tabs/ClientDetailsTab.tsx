
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClientSelector from '../clientDetails/ClientSelector';
import ClientTaskDetails from '../clientDetails/ClientTaskDetails';
import ClientDetailsHeader from '../clientDetails/ClientDetailsHeader';
import ClientTaskFilters from '../clientDetails/ClientTaskFilters';
import ResponsiveClientView from '../clientDetails/ResponsiveClientView';

interface ClientDetailsTabProps {
  className?: string;
}

interface FilterState {
  dateRange: { start: Date; end: Date } | null;
  status: string[];
  skills: string[];
  categories: string[];
  priorities: string[];
  taskType: 'all' | 'recurring' | 'instances';
}

/**
 * Enhanced Client Details Tab Component
 * Now includes comprehensive task details, filtering, and responsive design
 */
export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ className }) => {
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    status: [],
    skills: [],
    categories: [],
    priorities: [],
    taskType: 'all'
  });

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.status.length) count++;
    if (filters.skills.length) count++;
    if (filters.categories.length) count++;
    if (filters.priorities.length) count++;
    if (filters.taskType !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Client Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Client Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
            />
          </CardContent>
        </Card>

        {/* Client Details Header - Only show when client is selected */}
        {selectedClientId && (
          <ClientDetailsHeader clientId={selectedClientId} />
        )}

        {/* Enhanced Client Task Details with Responsive Layout */}
        {selectedClientId ? (
          <ResponsiveClientView
            activeFilters={activeFilterCount}
            filtersComponent={
              <ClientTaskFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            }
          >
            <ClientTaskDetails clientId={selectedClientId} />
          </ResponsiveClientView>
        ) : (
          /* Empty State - Show when no client is selected */
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Select a Client</h3>
                <p className="mb-4">
                  Choose a client from the dropdown above to view their comprehensive task details, 
                  monthly breakdowns, and performance analytics.
                </p>
                <div className="text-sm">
                  <p className="mb-2"><strong>Available Features:</strong></p>
                  <ul className="text-left inline-block space-y-1">
                    <li>• Detailed task tables with advanced filtering</li>
                    <li>• Monthly task distribution and trends</li>
                    <li>• Skill-based analysis and breakdown</li>
                    <li>• Interactive drill-down capabilities</li>
                    <li>• Cross-tab navigation with context</li>
                    <li>• Mobile-optimized responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsTab;
