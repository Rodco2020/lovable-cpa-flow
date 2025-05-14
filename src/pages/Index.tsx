
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Calendar, BarChart2, UserCog, Database } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl font-bold">CPA Practice Management</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A minimalist, modular, and efficient system for managing your accounting practice.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/clients">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <CardTitle>Client Module</CardTitle>
              <CardDescription>
                Manage your client relationships and billing expectations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Client profile management</li>
                <li>• Revenue tracking</li>
                <li>• Client engagements</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Client Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tasks">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <CardTitle>Task Module</CardTitle>
              <CardDescription>
                Define and manage all work items within your firm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Task templates</li>
                <li>• Recurring assignments</li>
                <li>• Task queue management</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Task Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/staff">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center mb-2">
                <UserCog className="h-6 w-6 text-teal-700" />
              </div>
              <CardTitle>Staff Module</CardTitle>
              <CardDescription>
                Manage staff, skills, and schedule allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Staff profiles</li>
                <li>• Daily planner</li>
                <li>• Weekly availability</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Staff Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/skills">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-indigo-700" />
              </div>
              <CardTitle>Skills Module</CardTitle>
              <CardDescription>
                Define and manage the skills used across the practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Skill definitions</li>
                <li>• Proficiency levels</li>
                <li>• Skill categories</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Skills Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/schedule">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
              <CardTitle>Scheduler Module</CardTitle>
              <CardDescription>
                Allocate resources and manage staff workloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Workload scheduling</li>
                <li>• Staff availability</li>
                <li>• Resource allocation</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/forecast">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                <BarChart2 className="h-6 w-6 text-amber-700" />
              </div>
              <CardTitle>Forecasting Module</CardTitle>
              <CardDescription>
                Project capacity, demand, and financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Capacity planning</li>
                <li>• Revenue forecasting</li>
                <li>• Gap analysis</li>
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;
