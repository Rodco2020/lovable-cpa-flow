
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ForecastDashboard from "@/components/forecasting/ForecastDashboard";
import ForecastTestPage from "@/components/forecasting/ForecastTestPage";
import ForecastSkillDebugger from "@/components/forecasting/ForecastSkillDebugger";
import IntegrationVerificationPanel from "@/components/forecasting/matrix/IntegrationVerificationPanel";
import { IntegrationTestPanel } from "@/components/forecasting/matrix/components/demand/testing/IntegrationTestPanel";
import { DemandMatrixDocumentation } from "@/components/forecasting/matrix/components/demand/DemandMatrixDocumentation";

const ForecastingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ForecastDashboard />} />
      <Route path="test" element={<ForecastTestPage />} />
      <Route path="debug" element={<ForecastDebugPage />} />
      <Route path="phase5" element={<Phase5TestingPage />} />
      <Route path="*" element={<Navigate to="/forecasting" replace />} />
    </Routes>
  );
};

// Enhanced debug page with Phase 4 and 5 integration testing
const ForecastDebugPage: React.FC = () => {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forecast Debugging Tools</h1>
          <p className="text-muted-foreground">
            Use these tools to investigate capacity, skill mapping, and integration issues.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Phase 4: Integration Testing Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Phase 4: Integration Testing</h2>
              <p className="text-sm text-muted-foreground">
                Verify that the matrix visualization correctly displays the updated calculations
                and ensure system-wide consistency between calculation engines and UI components.
              </p>
            </div>
            
            <IntegrationVerificationPanel recurringTasks={[]} staffOptions={[]} />
          </section>

          {/* Existing Skill Mapping Analysis */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Skill Mapping Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Analyze how staff skills are mapped to standard forecast skill types (Junior, Senior, CPA).
              </p>
            </div>
            
            <ForecastSkillDebugger />
          </section>
        </div>
      </div>
    </div>
  );
};

// NEW: Phase 5 Testing and Documentation Page
const Phase5TestingPage: React.FC = () => {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phase 5: Performance Optimization & Integration Testing</h1>
          <p className="text-muted-foreground">
            Comprehensive testing suite and documentation for the completed Phase 5 implementation.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Phase 5: Complete Documentation */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Complete Documentation</h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive documentation covering all Phase 5 features including staff filtering,
                performance optimization, and integration testing.
              </p>
            </div>
            
            <DemandMatrixDocumentation />
          </section>

          {/* Phase 5: Integration Testing */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Integration Testing Suite</h2>
              <p className="text-sm text-muted-foreground">
                Run comprehensive integration tests to verify performance optimization,
                cross-filter functionality, and real-time updates with staff filtering.
              </p>
            </div>
            
            <IntegrationTestPanel demandData={null} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ForecastingModule;
