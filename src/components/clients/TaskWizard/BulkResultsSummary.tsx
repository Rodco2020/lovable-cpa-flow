
/**
 * Bulk Results Summary - Legacy Export
 * 
 * This file maintains backward compatibility for existing imports
 * while delegating to the new modular structure.
 * 
 * @deprecated Use '@/components/clients/TaskWizard/BulkResultsSummary' instead for new code
 */

// Re-export the main component from the new modular structure
export { BulkResultsSummary } from './BulkResultsSummary/BulkResultsSummary';

// Re-export types for backward compatibility
export type { BulkResultsSummaryProps } from './BulkResultsSummary/types';
