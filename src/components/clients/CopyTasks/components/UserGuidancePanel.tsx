
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface UserGuidancePanelProps {
  currentStep: string;
  className?: string;
}

const GUIDANCE_CONTENT = {
  'select-client': {
    title: 'Select Target Client',
    tips: [
      'Choose the client you want to copy tasks to',
      'Only active clients are shown in the list',
      'You cannot copy tasks to the same client'
    ],
    warnings: [
      'Copied tasks will inherit the target client\'s default settings'
    ],
    shortcuts: [
      'Use the search bar to quickly find clients',
      'Click directly on a client card to select'
    ]
  },
  'select-tasks': {
    title: 'Select Tasks to Copy',
    tips: [
      'Use filters to narrow down the task list',
      'Both recurring and ad-hoc tasks can be copied',
      'Selected tasks will maintain their structure and relationships'
    ],
    warnings: [
      'Recurring patterns will be preserved in the target client',
      'Task dependencies may need manual adjustment after copying'
    ],
    shortcuts: [
      'Ctrl+A to select all visible tasks',
      'Ctrl+D to deselect all tasks',
      'Use the category and priority filters for quick selection'
    ]
  },
  'confirm': {
    title: 'Confirm Copy Operation',
    tips: [
      'Review the summary before proceeding',
      'The operation cannot be undone once started',
      'All selected tasks will be duplicated to the target client'
    ],
    warnings: [
      'Large operations may take several minutes',
      'Do not close the browser during the copy process'
    ],
    shortcuts: []
  },
  'processing': {
    title: 'Copy in Progress',
    tips: [
      'The system is copying your selected tasks',
      'Progress is shown in real-time',
      'You can monitor the operation status'
    ],
    warnings: [
      'Please do not navigate away from this page',
      'Closing the browser may interrupt the operation'
    ],
    shortcuts: []
  }
};

export const UserGuidancePanel: React.FC<UserGuidancePanelProps> = ({
  currentStep,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const guidance = GUIDANCE_CONTENT[currentStep as keyof typeof GUIDANCE_CONTENT];

  if (!guidance) {
    return null;
  }

  return (
    <Card className={`${className} border-blue-200 bg-blue-50/50`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Help & Guidance</span>
                <Badge variant="outline" className="text-xs">
                  {guidance.title}
                </Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Tips Section */}
            {guidance.tips.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-sm">Tips</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {guidance.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings Section */}
            {guidance.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium text-sm">Important Notes</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {guidance.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shortcuts Section */}
            {guidance.shortcuts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-sm">Shortcuts</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {guidance.shortcuts.map((shortcut, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{shortcut}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-muted-foreground"
              >
                Collapse Help
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
