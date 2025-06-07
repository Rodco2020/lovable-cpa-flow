
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

export interface MatrixPrintViewProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
  selectedClientIds: string[];
  clientNames: Record<string, string>;
  monthRange: { start: number; end: number };
  printOptions: {
    includeCharts: boolean;
    includeClientFilter: boolean;
    orientation: 'portrait' | 'landscape';
  };
  onPrint: () => void;
}

export interface PrintStyleProps {
  orientation: 'portrait' | 'landscape';
}

export interface ReportHeaderProps {
  filteredMonths: Array<{ label: string; key: string }>;
  selectedSkills: SkillType[];
  selectedClientIds: string[];
  clientNames: Record<string, string>;
  printOptions: {
    includeClientFilter: boolean;
  };
}

export interface MatrixTableProps {
  matrixData: MatrixData;
  filteredSkills: SkillType[];
  filteredMonths: Array<{ label: string; key: string }>;
}

export interface SummaryStatsProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
}
