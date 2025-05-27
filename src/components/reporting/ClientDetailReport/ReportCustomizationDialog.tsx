
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReportCustomization } from "@/types/clientReporting";

interface ReportCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: ReportCustomization;
  onCustomizationChange: (customization: ReportCustomization) => void;
}

export const ReportCustomizationDialog: React.FC<ReportCustomizationDialogProps> = ({
  open,
  onOpenChange,
  customization,
  onCustomizationChange
}) => {
  const handleChange = (field: keyof ReportCustomization, value: any) => {
    onCustomizationChange({
      ...customization,
      [field]: value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Report</DialogTitle>
          <DialogDescription>
            Customize the appearance and content of your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={customization.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <Select 
              value={customization.colorScheme} 
              onValueChange={(value) => handleChange('colorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Gray)</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Tasks By */}
          <div className="space-y-2">
            <Label>Group Tasks By</Label>
            <Select 
              value={customization.groupTasksBy} 
              onValueChange={(value) => handleChange('groupTasksBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-metrics">Show Metrics</Label>
              <Switch
                id="show-metrics"
                checked={customization.showMetrics}
                onCheckedChange={(checked) => handleChange('showMetrics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-charts">Show Charts</Label>
              <Switch
                id="show-charts"
                checked={customization.showCharts}
                onCheckedChange={(checked) => handleChange('showCharts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-logo">Include Logo</Label>
              <Switch
                id="include-logo"
                checked={customization.includeLogo}
                onCheckedChange={(checked) => handleChange('includeLogo', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-footer">Include Footer</Label>
              <Switch
                id="include-footer"
                checked={customization.includeFooter}
                onCheckedChange={(checked) => handleChange('includeFooter', checked)}
              />
            </div>
          </div>

          {/* Custom Footer Text */}
          {customization.includeFooter && (
            <div className="space-y-2">
              <Label htmlFor="footer-text">Footer Text</Label>
              <Textarea
                id="footer-text"
                value={customization.customFooterText}
                onChange={(e) => handleChange('customFooterText', e.target.value)}
                placeholder="Enter custom footer text..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
