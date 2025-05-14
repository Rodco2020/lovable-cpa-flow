
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getStaffById } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Edit, Mail, Phone } from "lucide-react";

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading staff details...</div>;
  }

  if (error || !staff) {
    return <div className="text-red-500 p-4">Error loading staff details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{staff.fullName}</h1>
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
                  <Badge variant={staff.status === "active" ? "success" : "destructive"} className="capitalize">
                    {staff.status}
                  </Badge>
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
                    {staff.skills.map((skillId) => (
                      <Badge key={skillId} variant="outline" className="bg-slate-100">
                        {skillId}
                      </Badge>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Weekly availability overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Link to={`/staff/${staff.id}/availability`} className="text-primary hover:underline">
                View and edit weekly availability
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <div key={day} className="text-center">
                  <div className="font-medium text-sm">{day}</div>
                  <div className="h-8 bg-green-100 rounded-sm mt-1 flex items-center justify-center">
                    <span className="text-xs text-green-700">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDetail;
