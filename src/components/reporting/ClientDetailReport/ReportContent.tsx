
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDetailReportData, ClientReportFilters, ReportCustomization } from "@/types/clientReporting";
import { ClientReportOverview } from "./ClientReportOverview";
import { ClientTaskBreakdown } from "./ClientTaskBreakdown";
import { ClientReportCharts } from "./ClientReportCharts";
import { ClientReportFiltersPanel } from "./ClientReportFiltersPanel";

interface ReportContentProps {
  reportData: ClientDetailReportData;
  filters: ClientReportFilters;
  customization: ReportCustomization;
  onFiltersChange: (filters: Partial<ClientReportFilters>) => void;
}

export const ReportContent: React.FC<ReportContentProps> = ({
  reportData,
  filters,
  customization,
  onFiltersChange
}) => {
  return (
    <>
      <ClientReportFiltersPanel 
        filters={filters} 
        onFiltersChange={onFiltersChange}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Breakdown</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientReportOverview data={reportData} customization={customization} />
        </TabsContent>

        <TabsContent value="tasks">
          <ClientTaskBreakdown data={reportData} customization={customization} />
        </TabsContent>

        <TabsContent value="charts">
          <ClientReportCharts data={reportData} />
        </TabsContent>
      </Tabs>
    </>
  );
};
