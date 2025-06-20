
export interface DemandExportData {
  dataPoints: Array<{
    skillType: any;
    month: string;
    demandHours: number;
    taskCount: number;
    clientCount: number;
    taskBreakdown: Array<{
      clientId: string;
      taskName: string;
      estimatedHours: number;
      preferredStaff: any;
    }>;
  }>;
}

export interface ExportConfig {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  groupingMode: 'skill' | 'client';
  format: 'csv' | 'json';
}

export class EnhancedMatrixExportUtils {
  static generateEnhancedCSVExport(data: DemandExportData, config: ExportConfig): string {
    const headers = ['Skill Type', 'Month', 'Demand Hours', 'Task Count', 'Client Count', 'Filter Mode'];
    const rows = data.dataPoints.map(point => [
      point.skillType,
      point.month,
      point.demandHours,
      point.taskCount,
      point.clientCount,
      config.preferredStaffFilterMode
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static generateEnhancedJSONExport(data: DemandExportData, config: ExportConfig): string {
    return JSON.stringify({
      metadata: {
        exportDate: new Date().toISOString(),
        filterMode: config.preferredStaffFilterMode,
        selectedFilters: {
          skills: config.selectedSkills,
          clients: config.selectedClients,
          preferredStaff: config.selectedPreferredStaff
        }
      },
      data: data.dataPoints
    }, null, 2);
  }
}
