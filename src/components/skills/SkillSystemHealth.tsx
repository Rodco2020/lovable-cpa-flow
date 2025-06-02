
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { getAllSkills } from '@/services/skills/skillsService';
import { validateCriticalSkillsPresent, getCriticalSkills } from '@/services/skills/defaults';

/**
 * Skills System Health Component
 * 
 * Monitors the health of the skills system and provides diagnostics
 * for critical skills that are required for the application to function properly.
 */
const SkillSystemHealth: React.FC = () => {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['skills-health-check'],
    queryFn: getAllSkills,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const healthStatus = validateCriticalSkillsPresent(skills);
  const criticalSkills = getCriticalSkills();

  const handleRefresh = () => {
    setLastCheck(new Date());
    refetch();
  };

  const getHealthIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (error || !healthStatus.isValid) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getHealthMessage = () => {
    if (isLoading) return "Checking skills system health...";
    if (error) return "Unable to connect to skills database";
    if (!healthStatus.isValid) {
      return `Missing critical skills: ${healthStatus.missingSkills.join(', ')}`;
    }
    return "All critical skills are present and accessible";
  };

  const getHealthVariant = () => {
    if (error || !healthStatus.isValid) return "destructive";
    return "default";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Skills System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={getHealthVariant()}>
          <div className="flex items-center gap-2">
            {getHealthIcon()}
            <div className="flex-1">
              <AlertTitle>System Status</AlertTitle>
              <AlertDescription>{getHealthMessage()}</AlertDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Total Skills</h4>
            <div className="text-2xl font-bold">{skills.length}</div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Critical Skills Status</h4>
            <div className="flex gap-1">
              {criticalSkills.map(skill => {
                const isPresent = skills.some(s => s.name === skill.name);
                return (
                  <Badge 
                    key={skill.name} 
                    variant={isPresent ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {skill.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Last Check</h4>
            <div className="text-sm text-muted-foreground">
              {lastCheck.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {healthStatus.missingSkills.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Skills Missing</AlertTitle>
            <AlertDescription>
              The following critical skills are missing from the database: {healthStatus.missingSkills.join(', ')}. 
              This may cause issues with forecasting and task assignment. Please contact your system administrator.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillSystemHealth;
