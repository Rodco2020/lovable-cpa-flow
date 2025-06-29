/**
 * Staff Service Module
 * Centralizes all staff-related services and functions
 */

// Re-export all individual services
export * from './staffService';
export * from './timeSlotService';
export * from './availabilityService';
export * from './defaultTemplateService';
export * from './skillMappingService';
export * from './staffMapper';
export * from './staffDropdownService';

// New UUID resolution and validation services
export { UuidResolutionService } from './uuidResolutionService';
export { StaffFilterValidationService } from './staffFilterValidationService';
export { StaffFilteringIntegrationTestService } from './integrationTestService';
export type { IntegrationTestResult } from './integrationTestService';
