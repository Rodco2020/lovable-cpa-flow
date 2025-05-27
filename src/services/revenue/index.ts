
/**
 * Revenue Service - Main Export
 * 
 * Maintains backward compatibility while using the new modular revenue system
 */

// Re-export types
export * from './types';

// Re-export the service
export { RevenueService } from './revenueService';

// Create a global instance for backward compatibility
import { RevenueService } from './revenueService';
export const revenueCalculationService = new RevenueService();

// Default export
export default revenueCalculationService;
