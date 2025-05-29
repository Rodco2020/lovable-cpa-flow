
/**
 * Re-export the refactored useCopyTasksDialog hook
 * This maintains backward compatibility while using the new modular structure
 */
export { useCopyTasksDialog } from './useCopyTasksDialog/index';
export type { UseCopyTasksDialogReturn, UseCopyTasksDialogProps, CopyTaskStep } from './useCopyTasksDialog/types';
