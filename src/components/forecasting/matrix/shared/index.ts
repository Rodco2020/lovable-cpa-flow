/**
 * Shared Matrix Components - Phase 5
 * 
 * Generic components that can be used by both Demand and Detail matrices.
 * Promotes code reuse and consistency across different matrix implementations.
 */

export { MatrixControlsPanel } from './MatrixControlsPanel';
export { MatrixGridLoading, MatrixControlsLoading } from './MatrixLoadingStates';

// Re-export common types that both matrices might use
export interface SharedMatrixProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

export interface MatrixFilterState {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
}

export interface MatrixControlsActions {
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staff: string) => void;
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onPrintExport: () => void;
  onReset: () => void;
}