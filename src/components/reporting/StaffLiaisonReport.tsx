
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffLiaisonSummary } from "./StaffLiaisonReport/StaffLiaisonSummary";
import { StaffLiaisonCharts } from "./StaffLiaisonReport/StaffLiaisonCharts";
import { StaffLiaisonFilters } from "./StaffLiaisonReport/StaffLiaisonFilters";
import { StaffLiaisonDrillDown } from "./StaffLiaisonReport/StaffLiaisonDrillDown";
import { getStaffLiaisonReportData } from "@/services/reporting/staffLiaisonReportService";
import { ReportFilters } from "@/types/reporting";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const StaffLiaisonReport: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    },
    taskTypes: [],
    status: [],
    staffLiaisonIds: []
  });

  const [selectedLiaisonId, setSelectedLiaisonId] = useState<string | null>(null);

  const { 
    data: reportData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["staff-liaison-report", filters],
    queryFn: () => getStaffLiaisonReportData(filters),
    refetchOnWindowFocus: false
  });

  const handleFiltersChange = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleLiaisonSelect = (liaisonId: string) => {
    setSelectedLiaisonId(liaisonId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Failed to load report data</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Liaison Revenue Report</h2>
          <p className="text-muted-foreground">
            Revenue analysis grouped by staff liaison assignments
          </p>
        </div>
      </div>

      <StaffLiaisonFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        availableStaff={reportData?.availableStaff || []}
      />

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="drilldown">Drill Down</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <StaffLiaisonSummary 
            data={reportData?.summary || []}
            onLiaisonSelect={handleLiaisonSelect}
          />
        </TabsContent>

        <TabsContent value="charts">
          <StaffLiaisonCharts data={reportData?.summary || []} />
        </TabsContent>

        <TabsContent value="drilldown">
          <StaffLiaisonDrillDown 
            selectedLiaisonId={selectedLiaisonId}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffLiaisonReport;
