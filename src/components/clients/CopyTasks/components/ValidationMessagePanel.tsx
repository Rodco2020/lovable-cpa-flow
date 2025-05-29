
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  field?: string;
}

interface ValidationMessagePanelProps {
  messages: ValidationMessage[];
  className?: string;
}

const MESSAGE_CONFIG = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50',
    iconClassName: 'text-green-500',
    textClassName: 'text-green-800'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50',
    iconClassName: 'text-yellow-500',
    textClassName: 'text-yellow-800'
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50',
    iconClassName: 'text-red-500',
    textClassName: 'text-red-800'
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50',
    iconClassName: 'text-blue-500',
    textClassName: 'text-blue-800'
  }
} as const;

export const ValidationMessagePanel: React.FC<ValidationMessagePanelProps> = ({
  messages,
  className = ''
}) => {
  if (messages.length === 0) {
    return null;
  }

  const groupedMessages = messages.reduce((groups, message) => {
    if (!groups[message.type]) {
      groups[message.type] = [];
    }
    groups[message.type].push(message);
    return groups;
  }, {} as Record<string, ValidationMessage[]>);

  return (
    <div className={`space-y-3 ${className}`}>
      {Object.entries(groupedMessages).map(([type, typeMessages]) => {
        const config = MESSAGE_CONFIG[type as keyof typeof MESSAGE_CONFIG];
        const Icon = config.icon;

        return (
          <Alert key={type} className={config.className}>
            <Icon className={`h-4 w-4 ${config.iconClassName}`} />
            <AlertDescription className={config.textClassName}>
              <div className="space-y-2">
                {typeMessages.length === 1 ? (
                  <div className="flex items-center justify-between">
                    <span>{typeMessages[0].message}</span>
                    {typeMessages[0].field && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {typeMessages[0].field}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">
                        {typeMessages.length} {type} message{typeMessages.length > 1 ? 's' : ''}:
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {typeMessages.map((msg, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span>• {msg.message}</span>
                          {msg.field && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {msg.field}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
