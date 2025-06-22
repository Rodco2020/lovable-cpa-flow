
import { SkillType } from './task';

export interface EnhancedExportOptions {
  format?: 'csv' | 'json' | 'xlsx';
  filename?: string;
  includeFilterSummary?: boolean;
  includeSkillResolutionInfo?: boolean;
}

export interface ExportMetadata {
  exportDate: string;
  totalDataPoints: number;
  appliedFilters: {
    skills: SkillType[];
    clients: string[];
    preferredStaff: string[];
    preferredStaffMode: string;
  };
  skillResolutionInfo?: {
    totalSkills: number;
    resolvedSkills: number;
    unresolvedSkills: number;
  };
}

export interface ExportDataRow {
  skill: string;
  month: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  totalTasks: number;
  taskDetails?: string;
}
