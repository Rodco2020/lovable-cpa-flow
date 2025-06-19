
/**
 * User Acceptance Tests for Preferred Staff Scenarios
 * Tests real-world scenarios involving preferred staff assignments and filtering
 * 
 * Test Structure:
 * - Scenario 1: Basic preferred staff display
 * - Scenario 2: Staff filtering functionality
 * - Scenario 3: Unassigned task handling
 * - Scenario 4: Staff workload analysis
 * - Scenario 5: Multi-skill staff assignments
 * 
 * Each scenario validates specific user workflows and UI interactions
 * without modifying the underlying business logic or visual appearance.
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import {
  runBasicPreferredStaffDisplayTests,
  runStaffFilteringTests,
  runUnassignedTaskTests,
  runStaffWorkloadAnalysisTests,
  runMultiSkillStaffTests
} from './preferredStaffScenarios/scenarioTests';

// Mock the service
vi.mock('@/services/forecasting/demandMatrixService');

describe('Preferred Staff User Acceptance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  // Execute all scenario test suites
  runBasicPreferredStaffDisplayTests();
  runStaffFilteringTests();
  runUnassignedTaskTests();
  runStaffWorkloadAnalysisTests();
  runMultiSkillStaffTests();
});
