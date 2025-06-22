import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecurringTaskDB } from '@/types/task';
import { SkillSummary } from '@/types/demand';

interface Phase2ValidationPanelProps {
  recurringTasks: RecurringTaskDB[];
  staffOptions: Array<{ id: string; full_name: string }>;
}

export const Phase2ValidationPanel: React.FC<Phase2ValidationPanelProps> = ({
  recurringTasks,
  staffOptions
}) => {
  const [validationResults, setValidationResults] = useState<any>(null);

  // FIXED: Create proper mock data with correct types
  const mockRecurringTasks: RecurringTaskDB[] = [
    {
      id: 'task-1',
      template_id: 'template-1',
      client_id: 'client-1',
      name: 'Monthly Tax Preparation',
      description: 'Prepare monthly tax documents',
      estimated_hours: 15,
      required_skills: ['Tax Preparation', 'Data Analysis'],
      priority: 'High',
      category: 'Tax',
      status: 'Unscheduled',
      due_date: null,
      recurrence_type: 'Monthly',
      recurrence_interval: 1,
      weekdays: null,
      day_of_month: 15,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      is_active: true,
      preferred_staff_id: 'staff-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      notes: null,
      clients: {
        id: 'client-1',
        legal_name: 'ABC Corp'
      }
    },
    {
      id: 'task-2',
      template_id: 'template-2',
      client_id: 'client-2',
      name: 'Quarterly Audit Review',
      description: 'Quarterly audit review',
      estimated_hours: 25,
      required_skills: ['Audit', 'Risk Assessment'],
      priority: 'Medium',
      category: 'Audit',
      status: 'Unscheduled',
      due_date: null,
      recurrence_type: 'Quarterly',
      recurrence_interval: 1,
      weekdays: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      is_active: true,
      preferred_staff_id: 'staff-2',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      notes: null,
      clients: {
        id: 'client-2',
        legal_name: 'XYZ Ltd'
      }
    },
    {
      id: 'task-3',
      template_id: 'template-3',
      client_id: 'client-3',
      name: 'Annual Financial Advisory',
      description: 'Annual financial planning session',
      estimated_hours: 40,
      required_skills: ['Financial Advisory', 'Planning'],
      priority: 'Low',
      category: 'Advisory',
      status: 'Unscheduled',
      due_date: null,
      recurrence_type: 'Annually',
      recurrence_interval: 1,
      weekdays: null,
      day_of_month: null,
      month_of_year: 12,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      is_active: true,
      preferred_staff_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      notes: null,
      clients: {
        id: 'client-3',
        legal_name: 'DEF Inc'
      }
    }
  ];

  // FIXED: Create proper SkillSummary array instead of object
  const mockSkillSummary: SkillSummary[] = [
    {
      skillType: 'Tax Preparation',
      totalDemand: 150,
      totalHours: 120,
      taskCount: 8,
      clientCount: 5
    },
    {
      skillType: 'Audit',
      totalDemand: 200,
      totalHours: 180,
      taskCount: 6,
      clientCount: 4
    },
    {
      skillType: 'Financial Advisory',
      totalDemand: 100,
      totalHours: 90,
      taskCount: 3,
      clientCount: 3
    }
  ];

  const runValidation = () => {
    const validation = {
      tasksValidation: validateTasks(),
      skillsValidation: validateSkills(),
      integrityValidation: validateDataIntegrity()
    };
    setValidationResults(validation);
  };

  const validateTasks = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    mockRecurringTasks.forEach((task, index) => {
      const staffId = task.preferred_staff_id;
      if (staffId && !staffOptions.find(staff => staff.id === staffId)) {
        warnings.push(`Task ${index + 1}: Preferred staff ID "${staffId}" not found in staff options`);
      }

      if (!task.required_skills || task.required_skills.length === 0) {
        issues.push(`Task ${index + 1}: No required skills specified`);
      }

      if (task.estimated_hours <= 0) {
        issues.push(`Task ${index + 1}: Invalid estimated hours`);
      }
    });

    return { issues, warnings, isValid: issues.length === 0 };
  };

  const validateSkills = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(mockSkillSummary)) {
      issues.push('Skill summary should be an array');
    } else {
      mockSkillSummary.forEach((skill, index) => {
        if (!skill.skillType) {
          issues.push(`Skill ${index + 1}: Missing skill type`);
        }
        if (skill.totalDemand < 0 || skill.totalHours < 0) {
          issues.push(`Skill ${index + 1}: Invalid demand or hours values`);
        }
      });
    }

    return { issues, warnings, isValid: issues.length === 0 };
  };

  const validateDataIntegrity = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    const taskSkills = new Set<string>();
    mockRecurringTasks.forEach(task => {
      task.required_skills.forEach(skill => taskSkills.add(skill));
    });

    const summarySkills = new Set(mockSkillSummary.map(s => s.skillType));

    taskSkills.forEach(skill => {
      if (!summarySkills.has(skill)) {
        warnings.push(`Skill "${skill}" found in tasks but missing from skill summary`);
      }
    });

    return { issues, warnings, isValid: issues.length === 0 };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase 2: Data Validation Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runValidation}>
          Run Validation Tests
        </Button>

        {validationResults && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Task Validation</h4>
              <Badge variant={validationResults.tasksValidation.isValid ? "default" : "destructive"}>
                {validationResults.tasksValidation.isValid ? "Valid" : "Issues Found"}
              </Badge>
              {validationResults.tasksValidation.issues.map((issue: string, index: number) => (
                <div key={index} className="text-sm text-red-600">• {issue}</div>
              ))}
              {validationResults.tasksValidation.warnings.map((warning: string, index: number) => (
                <div key={index} className="text-sm text-yellow-600">⚠ {warning}</div>
              ))}
            </div>

            <div>
              <h4 className="font-medium">Skills Validation</h4>
              <Badge variant={validationResults.skillsValidation.isValid ? "default" : "destructive"}>
                {validationResults.skillsValidation.isValid ? "Valid" : "Issues Found"}
              </Badge>
              {validationResults.skillsValidation.issues.map((issue: string, index: number) => (
                <div key={index} className="text-sm text-red-600">• {issue}</div>
              ))}
            </div>

            <div>
              <h4 className="font-medium">Data Integrity</h4>
              <Badge variant={validationResults.integrityValidation.isValid ? "default" : "destructive"}>
                {validationResults.integrityValidation.isValid ? "Valid" : "Issues Found"}
              </Badge>
              {validationResults.integrityValidation.warnings.map((warning: string, index: number) => (
                <div key={index} className="text-sm text-yellow-600">⚠ {warning}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
