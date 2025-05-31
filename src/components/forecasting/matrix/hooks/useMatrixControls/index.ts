
/**
 * Matrix Controls Hook Module
 * 
 * Refactored architecture providing enhanced maintainability and modularity
 * while preserving all existing functionality and APIs.
 */

export { useMatrixControls as default } from './useMatrixControls';
export { useMatrixControls } from './useMatrixControls';

export type {
  MatrixControlsState,
  UseMatrixControlsProps,
  UseMatrixControlsResult
} from './types';

// Export utilities for testing and advanced usage
export { 
  generateCSVData, 
  downloadCSV,
  useExportHandler 
} from './exportUtils';

export { 
  useSkillsSync, 
  getEffectiveSkills 
} from './skillsSync';

export { useStateHandlers } from './stateHandlers';
