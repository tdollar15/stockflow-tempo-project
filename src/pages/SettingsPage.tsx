import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { toast } from '../components/ui/use-toast';

// Enum for application themes
enum AppTheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

// Enum for notification preferences
enum NotificationPreference {
  All = 'all',
  Important = 'important',
  None = 'none'
}

// Interface for application settings
interface AppSettings {
  theme: AppTheme;
  notifications: NotificationPreference;
  language: string;
  dateFormat: string;
  storageLimit: number;
  securitySettings: {
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
}

const SettingsPage: React.FC = () => {
  // Default settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: AppTheme.System,
    notifications: NotificationPreference.Important,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    storageLimit: 500, // MB
    securitySettings: {
      twoFactorAuth: false,
      loginAttempts: 5
    }
  });

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Update a specific setting
  const updateSetting = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update nested settings
  const updateNestedSetting = <K extends keyof AppSettings>(
    parentKey: K, 
    childKey: string, 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as object),
        [childKey]: value
      }
    }));
  };

  // Save and apply settings
  const saveSettings = () => {
    // Here you would typically sync with backend or global state
    toast({
      title: "Settings Saved",
      description: "Your application settings have been updated.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general">
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select 
                    value={settings.theme}
                    onValueChange={(value) => updateSetting('theme', value as AppTheme)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AppTheme).map(theme => (
                        <SelectItem key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notifications</Label>
                  <Select 
                    value={settings.notifications}
                    onValueChange={(value) => updateSetting('notifications', value as NotificationPreference)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(NotificationPreference).map(pref => (
                        <SelectItem key={pref} value={pref}>
                          {pref.charAt(0).toUpperCase() + pref.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select 
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Format</Label>
                  <Select 
                    value={settings.dateFormat}
                    onValueChange={(value) => updateSetting('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Two-Factor Authentication</Label>
                  <Switch
                    checked={settings.securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      updateNestedSetting('securitySettings', 'twoFactorAuth', checked)
                    }
                  />
                </div>

                <div>
                  <Label>Maximum Login Attempts</Label>
                  <Input 
                    type="number" 
                    value={settings.securitySettings.loginAttempts}
                    onChange={(e) => 
                      updateNestedSetting(
                        'securitySettings', 
                        'loginAttempts', 
                        parseInt(e.target.value)
                      )
                    }
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Settings Tab */}
            <TabsContent value="advanced">
              <div className="space-y-4">
                <div>
                  <Label>Storage Limit</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      value={settings.storageLimit}
                      onChange={(e) => 
                        updateSetting('storageLimit', parseInt(e.target.value))
                      }
                      min={100}
                      max={2000}
                    />
                    <span>MB</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
