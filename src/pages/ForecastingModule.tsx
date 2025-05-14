
import React from "react";
import { Routes, Route } from "react-router-dom";
import ForecastDashboard from "@/components/forecasting/ForecastDashboard";

const ForecastingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ForecastDashboard />} />
    </Routes>
  );
};

export default ForecastingModule;
