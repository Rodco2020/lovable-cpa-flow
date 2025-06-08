
/**
 * Mock Helpers for Demand Matrix Integration Tests
 * Utility functions for setting up mocks and test scenarios
 */

import { vi } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import eventService from '@/services/eventService';
import { mockDemandData } from './testData';

export const setupSuccessfulMocks = () => {
  (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
    matrixData: mockDemandData
  });
  
  (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([]);
};

export const setupErrorMocks = (error: string) => {
  (DemandMatrixService.generateDemandMatrix as any).mockRejectedValue(
    new Error(error)
  );
};

export const setupValidationErrorMocks = (errors: string[]) => {
  (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue(errors);
};

export const setupNetworkRetryMocks = () => {
  let callCount = 0;
  (DemandMatrixService.generateDemandMatrix as any).mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve({ matrixData: mockDemandData });
  });
};

export const getEventHandler = (eventType: string) => {
  const mockCalls = (eventService.subscribe as any).mock.calls;
  return mockCalls.find((call: any[]) => call[0] === eventType)?.[1];
};

export const triggerTaskEvent = (eventType: string, payload: any) => {
  const eventHandler = getEventHandler(eventType);
  if (eventHandler) {
    eventHandler({
      type: eventType,
      payload,
      timestamp: Date.now()
    });
  }
};
