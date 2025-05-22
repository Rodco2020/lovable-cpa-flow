
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, Play } from "lucide-react";

const SchedulerDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scheduler Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The Staff Scheduler helps you assign tasks to staff members based on
          their skills and availability. Choose between three scheduling modes:
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="manual">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="font-medium">Manual Mode</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <p>
                  In Manual mode, you have complete control over task assignments.
                  This is the traditional drag-and-drop interface.
                </p>
                <h4 className="font-medium">How to use:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Select a task from the Unscheduled Tasks list</li>
                  <li>Drag the task onto an available time slot in a staff member's calendar</li>
                  <li>The system will validate the assignment based on staff skills and availability</li>
                  <li>You'll receive feedback if there are any conflicts</li>
                </ol>
                <h4 className="font-medium mt-2">Best for:</h4>
                <ul className="list-disc pl-5">
                  <li>Making precise, one-off assignments</li>
                  <li>Special cases requiring human judgment</li>
                  <li>Smaller task volumes</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hybrid">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="font-medium">Hybrid Mode</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <p>
                  Hybrid mode combines AI recommendations with human oversight.
                  The system suggests optimal staff-task matches, but you make
                  the final decisions.
                </p>
                <h4 className="font-medium">How it works:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Select "Generate Recommendations" to analyze unscheduled tasks</li>
                  <li>The system evaluates staff skills, availability, and workload balance</li>
                  <li>A ranked list of staff recommendations appears for each task</li>
                  <li>Review and confirm each suggestion, or choose a different staff member</li>
                </ol>
                <h4 className="font-medium mt-2">The algorithm considers:</h4>
                <ul className="list-disc pl-5">
                  <li>Skill match quality (exact vs. related skills)</li>
                  <li>Current workload balance</li>
                  <li>Previous task history with the client</li>
                  <li>Staff availability windows</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="automatic">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                <span className="font-medium">Automatic Mode</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <p>
                  Automatic mode assigns multiple tasks at once without requiring
                  manual confirmation. It's designed for efficient batch scheduling.
                </p>
                <h4 className="font-medium">Configuration options:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Priority Weight</span>: How much to prioritize high-priority tasks</li>
                  <li><span className="font-medium">Due Date Weight</span>: How strongly to consider approaching due dates</li>
                  <li><span className="font-medium">Workload Balance</span>: How evenly to distribute tasks among staff</li>
                  <li><span className="font-medium">Skill Match Strictness</span>: Whether to require exact skill matches</li>
                </ul>
                <h4 className="font-medium mt-2">Process:</h4>
                <ol className="list-decimal pl-5">
                  <li>Configure your scheduling parameters</li>
                  <li>Click "Run Auto-Scheduler" to begin processing</li>
                  <li>The system analyzes all unscheduled tasks and makes assignments</li>
                  <li>Review the results summary and any errors or warnings</li>
                </ol>
                <p className="text-amber-700 mt-2">
                  Note: Automatic scheduling is best for routine tasks with clear
                  skill requirements. Complex or specialized tasks may still
                  require manual review.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SchedulerDocumentation;
