
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';

export interface SkillMappingResult {
  skills: SkillType[];
  skillMapping: Map<string, string>;
}

export interface DataPointGenerationContext {
  forecastData: ForecastData[];
  tasks: RecurringTaskDB[];
  skills: SkillType[];
  skillMapping: Map<string, string>;
}

export interface MatrixTotals {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
}

export interface SkillSummary {
  [key: string]: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
  };
}
