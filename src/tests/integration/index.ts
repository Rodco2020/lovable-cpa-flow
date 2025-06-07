
/**
 * Phase 5: Integration Testing Suite Index
 * 
 * This file exports all integration tests for the Enhanced Capacity Matrix
 * and ensures comprehensive testing coverage for Phase 5 validation.
 */

// Core integration tests
export * from './MatrixIntegration.test';
export * from './MatrixPerformance.test';
export * from './MatrixRegression.test';

// Test utilities and helpers
export * from './utils/testHelpers';

/**
 * Integration test categories covered:
 * 
 * 1. End-to-End Workflow Testing
 *    - Complete matrix load to client filtering workflow
 *    - All client selection combinations
 *    - Different forecast types and date ranges
 * 
 * 2. Regression Testing
 *    - All existing matrix functionality preserved
 *    - No impact on other forecasting features
 *    - Backward compatibility maintained
 * 
 * 3. Performance Validation
 *    - Large client datasets
 *    - Multiple client selections
 *    - Memory leak prevention
 *    - Rendering performance
 * 
 * 4. Feature Integration
 *    - Export functionality with client filtering
 *    - Print functionality with client filtering
 *    - Skill synchronization
 * 
 * 5. Error Handling Integration
 *    - Graceful error recovery
 *    - Data loading failure handling
 * 
 * Usage:
 * Run all integration tests with: npm test src/tests/integration
 * Run specific test suites individually for focused testing
 */
