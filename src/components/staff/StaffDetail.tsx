
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, ChevronLeft } from "lucide-react";
import { useSkillNames } from "@/hooks/useSkillNames";
import { useStaffDetail } from "@/hooks/useStaffDetail";
import BasicInformationCard from "./BasicInformationCard";
import SkillsAndCostCard from "./SkillsAndCostCard";
import AvailabilityCard from "./AvailabilityCard";

/**
 * StaffDetail Component
 * 
 * Displays detailed information about a staff member, including:
 * - Basic information (name, role, contact details)
 * - Skills and cost information
 * - Weekly availability overview
 * 
 * Provides navigation links to related actions (edit, schedule, availability)
 */
const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    staff,
    staffLoading,
    staffError,
    availabilitySummary,
    summaryLoading,
    navigate
  } = useStaffDetail(id);

  // Display loading state
  if (staffLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-lg font-medium mb-2">Loading staff details...</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/staff")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  // Display error state
  if (staffError || !staff) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg font-medium mb-4">
          Staff member not found or error loading details
        </div>
        <Button onClick={() => navigate("/staff")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Staff List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation and action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/staff")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{staff.fullName}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to={`/staff/${staff.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/staff/${staff.id}/schedule`}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information Card */}
        <BasicInformationCard staff={staff} />
        
        {/* Skills and Cost Card */}
        <SkillsAndCostCard staff={staff} />
        
        {/* Availability Card */}
        <AvailabilityCard 
          staffId={staff.id} 
          availabilitySummary={availabilitySummary} 
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
};

export default StaffDetail;
