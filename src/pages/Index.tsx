
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Clipboard, ListCheck, GraduationCap } from "lucide-react";

const Index: React.FC = () => {
  const modules = [
    {
      title: "Task Module",
      description: "Create and manage task templates, assign tasks to clients",
      icon: <Clipboard className="h-8 w-8 text-purple-600" />,
      link: "/tasks",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Client Module",
      description: "Manage client profiles and their tasks",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      link: "/clients",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Staff Module",
      description: "Manage staff profiles, skills, and scheduling",
      icon: <Users className="h-8 w-8 text-green-600" />,
      link: "/staff",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      title: "Skills Module",
      description: "Define and manage skills for task matching",
      icon: <GraduationCap className="h-8 w-8 text-amber-600" />,
      link: "/skills",
      color: "bg-amber-50 hover:bg-amber-100"
    },
    {
      title: "Scheduler Module",
      description: "Schedule tasks to staff with matching skills",
      icon: <Calendar className="h-8 w-8 text-indigo-600" />,
      link: "/scheduler",
      color: "bg-indigo-50 hover:bg-indigo-100"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">CPA Practice Management</h1>
        <p className="text-xl text-muted-foreground">
          Efficiently manage your practice with our integrated modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.title} to={module.link}>
            <Card className={`h-full transition-colors ${module.color}`}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-white shadow-sm">
                  {module.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">{module.title}</h2>
                <p className="text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
