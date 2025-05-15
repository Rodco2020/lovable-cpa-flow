
import React from "react";
import { Routes, Route } from "react-router-dom";
import ForecastDashboard from "@/components/forecasting/ForecastDashboard";
import ForecastTestPage from "@/components/forecasting/ForecastTestPage";

const ForecastingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ForecastDashboard />} />
      <Route path="test" element={<ForecastTestPage />} />
    </Routes>
  );
};

export default ForecastingModule;
