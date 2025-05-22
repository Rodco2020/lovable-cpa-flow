
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getStaffById, calculateAvailabilitySummary } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { CalendarDays, Edit, Mail, Phone, Clock, ChevronLeft } from "lucide-react";
import { useSkillNames } from "@/hooks/useSkillNames";
import { toast } from "sonner";

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: staff, isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
    onError: (error) => {
      console.error("Error fetching staff details:", error);
      toast.error("Failed to load staff details");
    }
  });

  const { data: availabilitySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["availability-summary", id],
    queryFn: () => calculateAvailabilitySummary(id || ""),
    enabled: !!id && !!staff,
    onError: (error) => {
      console.error("Error fetching availability summary:", error);
      // Don't show error toast here as this is not critical
    }
  });

  const { skillsMap, isLoading: skillsLoading } = useSkillNames(staff?.skills || []);

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

  // Map day number to day name for display
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Staff profile and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role / Title</dt>
                <dd>{staff.roleTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <CustomBadge variant={staff.status === "active" ? "success" : "destructive"} className="capitalize">
                    {staff.status}
                  </CustomBadge>
                </dd>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${staff.email}`} className="text-primary hover:underline">
                  {staff.email}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${staff.phone}`} className="hover:underline">
                  {staff.phone}
                </a>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Cost</CardTitle>
            <CardDescription>Assigned skills and billing rate</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cost per Hour</dt>
                <dd className="text-lg font-semibold">${staff.costPerHour.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">Skills</dt>
                <dd>
                  <div className="flex flex-wrap gap-2">
                    {skillsLoading ? (
                      <span className="text-sm text-muted-foreground">Loading skills...</span>
                    ) : staff.skills.length > 0 ? (
                      staff.skills.map((skillId) => (
                        <CustomBadge key={skillId} variant="outline" className="bg-slate-100">
                          {skillsMap[skillId]?.name || skillId}
                        </CustomBadge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills assigned</span>
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Weekly availability overview</CardDescription>
            </div>
            {!summaryLoading && availabilitySummary && (
              <div className="flex items-center bg-green-50 text-green-800 rounded-full px-3 py-1">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium">{availabilitySummary.weeklyTotal.toFixed(1)} hrs/week</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="text-center py-4">Loading availability...</div>
            ) : availabilitySummary ? (
              <>
                <div className="text-sm text-center mb-4">
                  <span className="text-muted-foreground">Average: </span>
                  <span className="font-medium">{availabilitySummary.averageDailyHours.toFixed(1)} hrs/day</span>
                </div>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((day) => {
                    const dayData = availabilitySummary.dailySummaries[day];
                    const hasAvailability = dayData && dayData.totalHours > 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div className="font-medium text-sm">{dayNames[day]}</div>
                        <div className={`h-8 ${hasAvailability ? 'bg-green-100' : 'bg-gray-100'} rounded-sm mt-1 flex flex-col items-center justify-center`}>
                          {hasAvailability ? (
                            <>
                              <span className="text-xs text-green-700">Available</span>
                              <span className="text-xs font-semibold text-green-800">{dayData.totalHours.toFixed(1)}h</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">Unavailable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-4">
                  <Link to={`/staff/${staff.id}/availability`} className="text-primary hover:underline text-sm">
                    View and edit detailed availability
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-amber-600">
                No availability data found. 
                <Link to={`/staff/${staff.id}/availability`} className="text-primary hover:underline block mt-2">
                  Set up availability
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDetail;
