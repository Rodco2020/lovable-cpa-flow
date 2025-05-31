
import { SkillType } from '@/types/task';

/**
 * Matrix Controls Types
 * Centralized type definitions for matrix controls functionality
 */

export interface MatrixControlsState {
  selectedSkills: SkillType[];
  viewMode: 'hours' | 'percentage';
  monthRange: { start: number; end: number };
}

export interface UseMatrixControlsProps {
  initialState?: Partial<MatrixControlsState>;
  matrixSkills?: SkillType[]; // Skills from matrix data for synchronization
}

export interface UseMatrixControlsResult extends MatrixControlsState {
  handleSkillToggle: (skill: SkillType) => void;
  handleViewModeChange: (viewMode: 'hours' | 'percentage') => void;
  handleMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  handleReset: () => void;
  handleExport: () => void;
  availableSkills: SkillType[];
  skillsLoading: boolean;
}
