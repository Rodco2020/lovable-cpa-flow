
/**
 * Matrix Testing Framework
 * Exports comprehensive testing utilities including Phase 4 components
 */
export { IntegrationTester } from './IntegrationTester';
export { Phase4TestingSuite } from './Phase4TestingSuite';
export { Phase4ComprehensiveTestRunner } from './Phase4ComprehensiveTestRunner';
export type {
  TestScenario,
  TestResult,
  IntegrationTestSuite
} from './IntegrationTester';
export type {
  EndToEndTestResult,
  RegressionTestResult,
  LoadTestResult,
  EdgeCaseTestResult,
  Phase4TestReport
} from './Phase4TestingSuite';
export type {
  Phase4CompletionReport
} from './Phase4ComprehensiveTestRunner';
