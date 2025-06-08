
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Keyboard, 
  Eye, 
  Volume2, 
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Accessibility Provider
 * Manages accessibility settings and provides screen reader announcements
 */
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    textSize: 'medium',
    screenReaderMode: false,
    keyboardNavigation: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load accessibility settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS classes based on settings
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Text size
    root.classList.remove('text-small', 'text-medium', 'text-large', 'text-extra-large');
    root.classList.add(`text-${settings.textSize}`);

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, announceToScreenReader }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility context
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

/**
 * Accessibility Control Panel
 */
export const AccessibilityControlPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4" />
              High Contrast
            </label>
            <Button
              variant={settings.highContrast ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            >
              {settings.highContrast ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <RotateCcw className="h-4 w-4" />
              Reduced Motion
            </label>
            <Button
              variant={settings.reducedMotion ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            >
              {settings.reducedMotion ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Text Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <ZoomIn className="h-4 w-4" />
              Text Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
                <Button
                  key={size}
                  variant={settings.textSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ textSize: size })}
                  className="capitalize"
                >
                  {size.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Screen Reader Mode */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="h-4 w-4" />
              Screen Reader Mode
            </label>
            <Button
              variant={settings.screenReaderMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ screenReaderMode: !settings.screenReaderMode })}
            >
              {settings.screenReaderMode ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Keyboard className="h-4 w-4" />
              Keyboard Navigation
            </label>
            <Button
              variant={settings.keyboardNavigation ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ keyboardNavigation: !settings.keyboardNavigation })}
            >
              {settings.keyboardNavigation ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Close Button */}
          <div className="pt-4 border-t">
            <Button onClick={onClose} className="w-full">
              Close Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Skip to Content Link
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
};
