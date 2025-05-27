
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
    <div className="space-y-6">
      {/* Filters Panel */}
      <section aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">
          Report Filters
        </h2>
        <ClientReportFiltersPanel 
          filters={filters} 
          onFiltersChange={onFiltersChange}
        />
      </section>

      {/* Main Report Tabs */}
      <section aria-labelledby="report-content-heading">
        <h2 id="report-content-heading" className="sr-only">
          Report Content
        </h2>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger 
              value="overview"
              className="text-sm"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tasks"
              className="text-sm"
            >
              <span className="hidden sm:inline">Task Breakdown</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts"
              className="text-sm"
            >
              <span className="hidden sm:inline">Charts & Analytics</span>
              <span className="sm:hidden">Charts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="overview"
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            tabIndex={-1}
          >
            <div role="tabpanel" aria-labelledby="overview-tab">
              <ClientReportOverview 
                data={reportData} 
                customization={customization} 
              />
            </div>
          </TabsContent>

          <TabsContent 
            value="tasks"
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            tabIndex={-1}
          >
            <div role="tabpanel" aria-labelledby="tasks-tab">
              <ClientTaskBreakdown 
                data={reportData} 
                customization={customization} 
              />
            </div>
          </TabsContent>

          <TabsContent 
            value="charts"
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            tabIndex={-1}
          >
            <div role="tabpanel" aria-labelledby="charts-tab">
              <ClientReportCharts data={reportData} />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};
