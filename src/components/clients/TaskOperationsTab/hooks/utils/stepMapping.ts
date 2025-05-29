
import { CopyTabStep } from '../useCopyTabSteps';
import { CopyTaskStep } from '../../../CopyTasks/hooks/useCopyTasksDialog/types';

/**
 * Maps between CopyTaskStep (6-step dialog) and CopyTabStep (Task Operations Tab)
 */
export const mapDialogStepToCopyTabStep = (dialogStep: CopyTaskStep): CopyTabStep => {
  switch (dialogStep) {
    case 'select-source-client':
      return 'select-source-client';
    case 'select-target-client':
      return 'selection';
    case 'select-tasks':
      return 'task-selection';
    case 'confirm':
      return 'confirmation';
    case 'processing':
      return 'processing';
    case 'success':
      return 'complete';
    default:
      return 'select-source-client';
  }
};

export const mapCopyTabStepToDialogStep = (tabStep: CopyTabStep): CopyTaskStep => {
  switch (tabStep) {
    case 'select-source-client':
      return 'select-source-client';
    case 'selection':
      return 'select-target-client';
    case 'task-selection':
      return 'select-tasks';
    case 'confirmation':
      return 'confirm';
    case 'processing':
      return 'processing';
    case 'complete':
      return 'success';
    default:
      return 'select-source-client';
  }
};
