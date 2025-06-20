
/**
 * Phase 1: Integration Tests Export
 * 
 * Centralized export for all Phase 1 integration tests
 */

export { default as Phase1IntegrationTests, Phase1IntegrationTests as Phase1IntegrationTestsComponent } from './Phase1IntegrationTests';

// Export test utilities
export { PipelineValidator } from '@/services/forecasting/demand/dataFetcher/integration/pipelineValidator';
export { ComponentIntegrationTester } from '@/components/forecasting/matrix/hooks/useMatrixControls/integration/integrationTester';

// Export result types
export type { PipelineValidationResult } from '@/services/forecasting/demand/dataFetcher/integration/pipelineValidator';
export type { ComponentIntegrationResult } from '@/components/forecasting/matrix/hooks/useMatrixControls/integration/integrationTester';
