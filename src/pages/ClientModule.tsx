
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ClientList from '@/components/clients/ClientList';
import ClientForm from '@/components/clients/ClientForm';
import ClientDetail from '@/components/clients/ClientDetail';
import ClientAssignedTasksOverview from '@/components/clients/ClientAssignedTasksOverview';
import { Button } from '@/components/ui/button';
import { Building, Users, DollarSign, FileText, PlusCircle, CalendarClock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientDashboardStats } from '@/hooks/useClientDashboardStats';
import { useEnhancedClientDashboardStats } from '@/hooks/useEnhancedClientDashboardStats';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { ClientMetricsFiltersComponent } from '@/components/clients/ClientMetricsFilters';
import { MetricsDisplayPanel } from '@/components/clients/MetricsDisplayPanel';

const ClientModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for filtered metrics
  const [metricsFilters, setMetricsFilters] = useState<ClientMetricsFilters>({});
  
  // Fetch real-time dashboard statistics with proper typing (existing functionality)
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useClientDashboardStats();
  
  // Fetch enhanced statistics with filtering support (new functionality)
  const { data: enhancedStats, isLoading: enhancedStatsLoading } = useEnhancedClientDashboardStats(metricsFilters);

  // Effect to detect navigation back to the client list
  useEffect(() => {
    if (location.pathname === '/clients' && location.key) {
      // Invalidate clients query cache when returning to the client list
      queryClient.invalidateQueries({
        queryKey: ['clients']
      });
      // Also invalidate dashboard stats to get fresh data
      queryClient.invalidateQueries({
        queryKey: ['clientDashboardStats']
      });
      // Invalidate enhanced stats
      queryClient.invalidateQueries({
        queryKey: ['enhancedClientDashboardStats']
      });
    }
  }, [location, queryClient]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to display stat value with loading state
  const displayStatValue = (value: number | undefined, isLoading: boolean) => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    return value?.toLocaleString() || '0';
  };

  // Helper function to display revenue with loading state
  const displayRevenueValue = (value: number | undefined, isLoading: boolean) => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    return formatCurrency(value || 0);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(metricsFilters).some(
    key => metricsFilters[key as keyof ClientMetricsFilters] != null
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Routes>
        <Route path="/" element={
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="font-bold text-6xl">Client Module</h1>
                <p className="text-muted-foreground">Manage your client relationships and revenue projections</p>
              </div>
              <Button onClick={() => navigate('/clients/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </div>
            
            {/* Global Dashboard Statistics (existing functionality) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-1 bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                  <div className="text-2xl font-semibold">
                    {displayStatValue(dashboardStats?.totalClients, statsLoading)}
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 bg-green-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Clients</div>
                  <div className="text-2xl font-semibold">
                    {displayStatValue(dashboardStats?.activeClients, statsLoading)}
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 bg-purple-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="rounded-full bg-purple-100 p-2">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  <div className="text-2xl font-semibold">
                    {displayRevenueValue(dashboardStats?.totalMonthlyRevenue, statsLoading)}
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 bg-amber-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="rounded-full bg-amber-100 p-2">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Engagements</div>
                  <div className="text-2xl font-semibold">
                    {displayStatValue(dashboardStats?.activeEngagements, statsLoading)}
                  </div>
                </div>
              </div>
            </div>
            
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">
                  Error loading dashboard statistics. Please refresh the page to try again.
                </p>
              </div>
            )}
            
            <Tabs defaultValue="clients" className="space-y-4">
              <TabsList>
                <TabsTrigger value="clients">Client Directory</TabsTrigger>
                <TabsTrigger value="tasks">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Client-Assigned Tasks
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients" className="space-y-6">
                {/* Enhanced Metrics Filter Controls - Phase 1 */}
                <ClientMetricsFiltersComponent
                  filters={metricsFilters}
                  onFiltersChange={setMetricsFilters}
                />
                
                {/* Filtered Metrics Display - Phase 1 */}
                {hasActiveFilters && enhancedStats?.filtered && (
                  <MetricsDisplayPanel
                    stats={enhancedStats.filtered}
                    isLoading={enhancedStatsLoading}
                    isVisible={hasActiveFilters}
                  />
                )}
                
                <ClientList metricsFilters={metricsFilters} />
              </TabsContent>
              
              <TabsContent value="tasks">
                <ClientAssignedTasksOverview />
              </TabsContent>
            </Tabs>
          </>
        } />
        <Route path="/new" element={<ClientForm />} />
        <Route path="/:id" element={<ClientDetail />} />
        <Route path="/:id/edit" element={<ClientForm />} />
      </Routes>
    </div>
  );
};

export default ClientModule;
