
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllStaff } from "@/services/staffService";
import { Staff } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, UserCog } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomBadge } from "@/components/ui/custom-badge"; // Updated import

const StaffList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: staffList, isLoading, error } = useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
  });

  const filteredStaff = staffList?.filter(
    (staff) =>
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading staff data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading staff data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Staff List</h1>
        <Button asChild>
          <Link to="/staff/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Staff
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff by name, role, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Role / Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cost/Hour</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                        <Link to={`/staff/${staff.id}/schedule`}>
                          Schedule
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
