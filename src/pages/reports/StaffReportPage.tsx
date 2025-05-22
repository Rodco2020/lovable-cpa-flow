
import React from "react";
import StaffReport from "@/components/reporting/StaffReport";

const StaffReportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff Skills & Availability Report</h1>
      <StaffReport />
    </div>
  );
};

export default StaffReportPage;
