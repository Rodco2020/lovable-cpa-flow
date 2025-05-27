
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const ReportErrorScreen: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load report data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </CardContent>
    </Card>
  );
};
