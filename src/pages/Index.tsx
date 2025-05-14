
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ListCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">CPA Practice Management Software</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A modular, efficient system for managing your CPA practice workflows
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListCheck className="mr-2 h-5 w-5" />
              Task Module
            </CardTitle>
            <CardDescription>
              Define, manage and track work items across your practice
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-sm text-gray-600">
              Create task templates, generate recurring tasks, and manage your unscheduled task queue
            </p>
            <Button asChild>
              <Link to="/tasks">Open Task Module</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Client Module</CardTitle>
            <CardDescription>
              Maintain client relationships and track client work
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-sm text-gray-600">
              Manage client profiles, revenue tracking, and client-specific task history
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Scheduler Module</CardTitle>
            <CardDescription>
              Efficiently allocate staff time to tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-sm text-gray-600">
              Schedule tasks, manage staff availability, and optimize workload distribution
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
