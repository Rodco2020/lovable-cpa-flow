
/**
 * Filtering Module Exports
 * 
 * Provides a clean interface for all filtering functionality using the strategy pattern.
 * This module enables flexible, testable, and maintainable filtering logic.
 */

// Core interfaces and base classes
export type { BaseFilterStrategy } from './baseFilterStrategy';
export { AbstractFilterStrategy } from './baseFilterStrategy';

// Concrete filter strategies
export { SkillFilterStrategy } from './skillFilterStrategy';
export { ClientFilterStrategy } from './clientFilterStrategy';
export { TimeHorizonFilterStrategy } from './timeHorizonFilterStrategy';

// Factory for managing strategies
export { FilterStrategyFactory } from './filterStrategyFactory';

// Re-export for backward compatibility
export { DataFilter } from '../dataFilter';
