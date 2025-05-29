

import { CopyTaskStep } from '../../../CopyTasks/hooks/useCopyTasksDialog/types';
import { CopyTabStep } from '../useCopyTabSteps';

/**
 * Optimized Step Mapping Utilities - Phase 5 Cleanup
 * 
 * Removed duplicate logic and optimized mappings between dialog and tab steps.
 * This ensures consistent step handling across all entry points.
 */

// Optimized mapping table for better performance - Fixed to match actual CopyTaskStep type
const DIALOG_TO_TAB_MAPPING: Record<CopyTaskStep, CopyTabStep> = {
  'select-source-client': 'select-source-client',
  'select-target-client': 'selection',
  'select-tasks': 'task-selection',
  'confirm': 'confirmation',
  'processing': 'processing',
  'success': 'complete'
};

const TAB_TO_DIALOG_MAPPING: Record<CopyTabStep, CopyTaskStep> = {
  'select-source-client': 'select-source-client',
  'selection': 'select-target-client',
  'task-selection': 'select-tasks',
  'confirmation': 'confirm',
  'processing': 'processing',
  'complete': 'success'
};

/**
 * Maps dialog step to copy tab step with performance optimization
 */
export const mapDialogStepToCopyTabStep = (dialogStep: CopyTaskStep): CopyTabStep => {
  const mapped = DIALOG_TO_TAB_MAPPING[dialogStep];
  if (!mapped) {
    console.warn('Unknown dialog step:', dialogStep, 'defaulting to select-source-client');
    return 'select-source-client';
  }
  return mapped;
};

/**
 * Maps copy tab step to dialog step with performance optimization
 */
export const mapCopyTabStepToDialogStep = (tabStep: CopyTabStep): CopyTaskStep => {
  const mapped = TAB_TO_DIALOG_MAPPING[tabStep];
  if (!mapped) {
    console.warn('Unknown tab step:', tabStep, 'defaulting to select-source-client');
    return 'select-source-client';
  }
  return mapped;
};

/**
 * Validates if a step is valid for both dialog and tab workflows
 */
export const isValidStep = (step: string): boolean => {
  return step in DIALOG_TO_TAB_MAPPING;
};

/**
 * Gets all valid steps for validation purposes
 */
export const getAllValidSteps = (): CopyTaskStep[] => {
  return Object.keys(DIALOG_TO_TAB_MAPPING) as CopyTaskStep[];
};

