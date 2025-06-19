
/**
 * Configuration and options for matrix transformation
 */
export interface TransformationOptions {
  includeRevenue?: boolean;
  fallbackSkillRate?: number;
  enableCaching?: boolean;
  enableValidation?: boolean;
  /**
   * NEW: Preferred staff processing options
   */
  preferredStaffOptions?: {
    enabled: boolean;
    includeRoleInfo: boolean;
    validateSkillMatching: boolean;
    fallbackToGeneric: boolean;
  };
}

export interface DataPointGenerationContext {
  forecastData: any[];
  tasks: any[];
  skills: string[];
  skillMapping: Map<string, string>;
}

export interface RevenueEnhancedDataPointContext extends DataPointGenerationContext {
  revenueContext?: {
    includeRevenueCalculations: boolean;
    skillFeeRates: Map<string, number>;
    clientRevenueData: Map<string, any>;
    useClientExpectedRevenue: boolean;
  };
  revenueCalculationConfig?: {
    enabled: boolean;
    useSkillFeeRates: boolean;
    useClientExpectedRevenue: boolean;
    fallbackToDefaultRates: boolean;
    includeProfitabilityAnalysis: boolean;
    cacheResults: boolean;
    batchSize: number;
  };
}
