
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ForecastDashboard from "@/components/forecasting/ForecastDashboard";
import ForecastTestPage from "@/components/forecasting/ForecastTestPage";

const ForecastingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ForecastDashboard />} />
      <Route path="test" element={<ForecastTestPage />} />
      <Route path="*" element={<Navigate to="/forecasting" replace />} />
    </Routes>
  );
};

export default ForecastingModule;
