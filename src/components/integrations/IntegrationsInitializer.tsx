
import { useEffect } from "react";
import { initializeForecastingIntegrations } from "@/services/integrations/forecastingIntegration";
import { initializeSchedulerIntegrations } from "@/services/integrations/schedulerIntegration";

/**
 * Component that initializes all module integrations
 * This should be mounted near the root of the application
 */
const IntegrationsInitializer = () => {
  useEffect(() => {
    // Initialize all module integrations
    initializeForecastingIntegrations();
    initializeSchedulerIntegrations();
    
    console.log("All module integrations initialized");
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default IntegrationsInitializer;
