
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Keyboard, Download, Settings, BarChart3 } from "lucide-react";

interface ReportHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportHelpDialog: React.FC<ReportHelpDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Client Detail Report Help
          </DialogTitle>
          <DialogDescription>
            Learn how to use and navigate the client detail report effectively
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Overview</CardTitle>
                <CardDescription>Understanding the client detail report structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Overview Tab</h4>
                  <p className="text-sm text-muted-foreground">
                    Displays client information, key metrics, and revenue breakdown by category.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Task Breakdown Tab</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows detailed task information, completion status, and timeline analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Charts & Analytics Tab</h4>
                  <p className="text-sm text-muted-foreground">
                    Provides visual representations of data trends and performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Navigation
                </CardTitle>
                <CardDescription>Navigate efficiently using keyboard shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                    <p className="text-sm text-muted-foreground">Navigate between elements</p>
                  </div>
                  <div className="space-y-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Tab</kbd>
                    <p className="text-sm text-muted-foreground">Navigate backwards</p>
                  </div>
                  <div className="space-y-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                    <p className="text-sm text-muted-foreground">Activate buttons/links</p>
                  </div>
                  <div className="space-y-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
                    <p className="text-sm text-muted-foreground">Close dialogs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Export reports in PDF, Excel, or CSV formats with customizable options.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Customization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Customize report appearance, color scheme, and included sections.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Data Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Filter data by date range, task types, status, and categories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Keyboard shortcuts for common actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Print Report</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + P</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Export Report</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + E</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Help</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">F1</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Refresh Data</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">F5</kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
