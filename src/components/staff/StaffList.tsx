
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllStaff, calculateAvailabilitySummary, ensureStaffHasAvailability } from "@/services/staffService";
import { Staff, AvailabilitySummary } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, UserCog, Calendar, RefreshCcw, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomBadge } from "@/components/ui/custom-badge";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StaffList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffAvailability, setStaffAvailability] = useState<Record<string, AvailabilitySummary>>({});
  const [isEnsuringAvailability, setIsEnsuringAvailability] = useState(false);
  
  const { data: staffList, isLoading, error, refetch } = useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
  });

  // Fetch availability summaries for each staff member
  useEffect(() => {
    const fetchAvailabilitySummaries = async () => {
      if (!staffList || staffList.length === 0) return;
      
      const availabilitySummaries: Record<string, AvailabilitySummary> = {};
      
      // Process staff in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < staffList.length; i += batchSize) {
        const batch = staffList.slice(i, i + batchSize);
        const summariesPromises = batch.map(staff => 
          calculateAvailabilitySummary(staff.id)
            .then(summary => ({ staffId: staff.id, summary }))
            .catch(err => {
              console.error(`Failed to fetch availability for staff ${staff.id}:`, err);
              return { staffId: staff.id, summary: null };
            })
        );
        
        const results = await Promise.all(summariesPromises);
        
        results.forEach(({ staffId, summary }) => {
          if (summary) {
            availabilitySummaries[staffId] = summary;
          }
        });
      }
      
      setStaffAvailability(availabilitySummaries);
    };
    
    if (staffList && staffList.length > 0) {
      fetchAvailabilitySummaries();
    }
  }, [staffList]);

  // Function to ensure all staff members have availability templates
  const handleEnsureAllAvailability = async () => {
    if (!staffList || staffList.length === 0) return;
    
    setIsEnsuringAvailability(true);
    
    try {
      const results = await Promise.all(
        staffList.map(staff => ensureStaffHasAvailability(staff.id))
      );
      
      const totalTemplates = results.reduce((sum, templates) => sum + templates.length, 0);
      
      toast({
        title: "Availability Templates Updated",
        description: `Ensured availability templates for ${staffList.length} staff members (${totalTemplates} total templates)`,
      });
      
      // Refresh availability summaries
      const availabilitySummaries: Record<string, AvailabilitySummary> = {};
      
      const summariesPromises = staffList.map(staff => 
        calculateAvailabilitySummary(staff.id)
          .then(summary => ({ staffId: staff.id, summary }))
      );
      
      const summariesResults = await Promise.all(summariesPromises);
      
      summariesResults.forEach(({ staffId, summary }) => {
        if (summary) {
          availabilitySummaries[staffId] = summary;
        }
      });
      
      setStaffAvailability(availabilitySummaries);
      
      // Notify the user to refresh forecasts
      toast({
        title: "Action Required",
        description: "Please refresh any open Forecasting views to see updated capacity values",
      });
      
    } catch (error) {
      console.error("Failed to ensure availability templates:", error);
      toast({
        title: "Error",
        description: "Failed to update some availability templates",
        variant: "destructive",
      });
    }
    
    setIsEnsuringAvailability(false);
  };

  const filteredStaff = staffList?.filter(
    (staff) =>
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format weekly hours
  const formatWeeklyHours = (hours: number): string => {
    return hours % 1 === 0 ? `${hours} hrs/week` : `${hours.toFixed(1)} hrs/week`;
  };

  // Count staff with zero or low weekly hours
  const staffWithIssues = staffList?.filter(staff => {
    const availability = staffAvailability[staff.id];
    return !availability || availability.weeklyTotal < 20;
  }).length || 0;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading staff data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading staff data: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Staff List</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/staff/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Staff
            </Link>
          </Button>
        </div>
      </div>

      {staffWithIssues > 0 && (
        <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Availability Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-amber-700 dark:text-amber-300 text-sm">
              {staffWithIssues} staff member(s) have missing or low weekly availability.
              This may cause zero capacity in forecasting. Click the button below to fix:
            </CardDescription>
            <Button 
              variant="default"
              className="mt-3 bg-amber-600 hover:bg-amber-700"
              onClick={handleEnsureAllAvailability}
              disabled={isEnsuringAvailability}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isEnsuringAvailability ? "animate-spin" : ""}`} />
              {isEnsuringAvailability ? "Updating..." : "Ensure All Availability Templates"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff by name, role, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Role / Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cost/Hour</TableHead>
              <TableHead>Weekly Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.fullName}</TableCell>
                  <TableCell>{staff.roleTitle}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>${staff.costPerHour.toFixed(2)}</TableCell>
                  <TableCell>
                    {staffAvailability[staff.id] ? (
                      <span className={`${staffAvailability[staff.id].weeklyTotal < 20 ? 'text-amber-600' : 'text-green-600'} font-medium`}>
                        {formatWeeklyHours(staffAvailability[staff.id].weeklyTotal)}
                      </span>
                    ) : (
                      <span className="text-red-500 italic">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <CustomBadge variant={staff.status === "active" ? "success" : "destructive"} className="capitalize">
                      {staff.status}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/staff/${staff.id}`}>
                          <UserCog className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/staff/${staff.id}/availability`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Availability
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StaffList;
