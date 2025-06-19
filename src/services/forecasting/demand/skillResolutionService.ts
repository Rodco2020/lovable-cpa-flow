
/**
 * Enhanced Skill Resolution Service - Refactored
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * All functionality remains exactly the same as before the refactor.
 * 
 * The service has been refactored into smaller, focused modules:
 * - CacheManager: Handles skill data caching
 * - Validator: Handles UUID validation and skill reference validation  
 * - Resolver: Handles the core skill resolution logic
 * - SkillResolutionService: Main orchestrator class
 */

export { SkillResolutionService } from './skillResolution';
