
import { SkillType } from '@/types/task';

/**
 * Core types for Matrix Controls components
 */
export interface MatrixControlsProps {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  viewMode: 'hours' | 'percentage';
  onViewModeChange: (mode: 'hours' | 'percentage') => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  className?: string;
}

export interface MonthRange {
  label: string;
  start: number;
  end: number;
}

export const MONTH_RANGES: MonthRange[] = [
  { label: 'All 12 Months', start: 0, end: 11 },
  { label: 'Q1 (Jan-Mar)', start: 0, end: 2 },
  { label: 'Q2 (Apr-Jun)', start: 3, end: 5 },
  { label: 'Q3 (Jul-Sep)', start: 6, end: 8 },
  { label: 'Q4 (Oct-Dec)', start: 9, end: 11 },
  { label: 'Next 6 Months', start: 0, end: 5 },
  { label: 'Last 6 Months', start: 6, end: 11 }
];
