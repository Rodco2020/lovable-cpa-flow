
import React from "react";
import { Staff } from "@/types/staff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Mail, Phone } from "lucide-react";

interface BasicInformationCardProps {
  staff: Staff;
}

/**
 * Component that displays the basic staff information in a card
 */
const BasicInformationCard: React.FC<BasicInformationCardProps> = ({ staff }) => {
  return (
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
  );
};

export default BasicInformationCard;
