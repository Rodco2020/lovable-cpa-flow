
export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  memoryUsage: number;
  operations: number;
  operationsPerSecond: number;
  passed: boolean;
}

export interface TestSize {
  skills: number;
  months: number;
  name: string;
}

export interface ValidationIssues {
  monthsCount?: string;
  skillsCount?: string;
  dataPointsCount?: string;
  trendsCount?: string;
  recommendationsCount?: string;
  alertsCount?: string;
  [key: string]: string | undefined;
}
