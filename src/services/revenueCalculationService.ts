
/**
 * Revenue Calculation Service - Backward Compatibility Layer
 * 
 * Maintains backward compatibility while using the new modular revenue system
 */

// Re-export everything from the new modular structure
export * from './revenue';

// Re-export the global instance for backward compatibility
export { revenueCalculationService } from './revenue';

// Default export
export { default } from './revenue';
