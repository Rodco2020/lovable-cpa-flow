
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ForecastDashboard from "@/components/forecasting/ForecastDashboard";
import ForecastTestPage from "@/components/forecasting/ForecastTestPage";
import ForecastSkillDebugger from "@/components/forecasting/ForecastSkillDebugger";
import { EnhancedIntegrationVerificationPanel } from "@/components/forecasting/matrix/EnhancedIntegrationVerificationPanel";
import { MarcianosTaskSummaryReport } from "@/components/forecasting/matrix/MarcianosTaskSummaryReport";
import { MarcianosTaskComparisonReport } from "@/components/forecasting/matrix/MarcianosTaskComparisonReport";
import { MultiStaffComparisonReport } from "@/components/forecasting/matrix/MultiStaffComparisonReport";

const ForecastingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ForecastDashboard />} />
      <Route path="test" element={<ForecastTestPage />} />
      <Route path="debug" element={<ForecastDebugPage />} />
      <Route path="*" element={<Navigate to="/forecasting" replace />} />
    </Routes>
  );
};

// Enhanced debug page with multi-staff comparison testing
const ForecastDebugPage: React.FC = () => {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forecast Debugging Tools</h1>
          <p className="text-muted-foreground">
            Enhanced debugging tools with UUID resolution, comprehensive staff filtering tests, and multi-staff filter comparison analysis.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* NEW: Multi-Staff Filter Comparison Report */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Multi-Staff Filter Comparison Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive comparison between preferred staff filters and Senior skill filter for Marciano Urbaez, Maria Vargas, and Luis Rodriguez.
              </p>
            </div>
            
            <MultiStaffComparisonReport />
          </section>

          {/* Marciano's Individual Filter Comparison Report */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Marciano's Individual Filter Comparison</h2>
              <p className="text-sm text-muted-foreground">
                Detailed comparison between preferred staff filter and Senior skill filter for Marciano Urbaez specifically.
              </p>
            </div>
            
            <MarcianosTaskComparisonReport />
          </section>

          {/* Enhanced Integration Verification Panel */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Enhanced Integration Verification</h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive testing of the staff filtering system with UUID resolution, validation, and end-to-end verification.
              </p>
            </div>
            
            <EnhancedIntegrationVerificationPanel />
          </section>

          {/* Enhanced Marciano's Task Summary Report */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Marciano's Task Summary Report (Enhanced)</h2>
              <p className="text-sm text-muted-foreground">
                Updated report using proper UUID resolution instead of hardcoded names. Now correctly identifies and filters Marciano's tasks.
              </p>
            </div>
            
            <MarcianosTaskSummaryReport />
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

export default ForecastingModule;
