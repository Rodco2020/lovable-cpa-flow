
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'available' | 'coming-soon';
  onClick?: () => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  status,
  onClick,
  className = ""
}) => {
  const isAvailable = status === 'available';
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isAvailable 
          ? 'hover:bg-gray-50 border-gray-200' 
          : 'opacity-60 cursor-not-allowed bg-gray-50'
      } ${className}`}
      onClick={isAvailable ? onClick : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${
            isAvailable ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">{title}</h4>
              <Badge 
                variant={isAvailable ? "default" : "secondary"}
                className={isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
              >
                {isAvailable ? 'Available' : 'Coming Soon'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
