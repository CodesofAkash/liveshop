// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Smartphone, 
  Mail, 
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    liveSessionAlerts: boolean;
    priceDrops: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showPurchaseHistory: boolean;
    showWishlist: boolean;
    allowDataCollection: boolean;
    cookiePreferences: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    autoPlayVideos: boolean;
    reducedMotion: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    deviceManagement: boolean;
  };
}

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: false,
      newsletter: true,
      liveSessionAlerts: true,
      priceDrops: true,
    },
    privacy: {
      profileVisibility: 'public',
      showPurchaseHistory: false,
      showWishlist: true,
      allowDataCollection: false,
      cookiePreferences: true,
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'system',
      autoPlayVideos: true,
      reducedMotion: false,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      deviceManagement: true,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Fetch user settings from API
    fetchUserSettings();
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/users/${user.id}/settings`);
      // const settingsData = await response.json();
      // setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // API call to save settings
      // await fetch(`/api/users/${user?.id}/settings`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
    setHasChanges(true);
  };

  const updatePrivacySettings = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
    setHasChanges(true);
  };

  const updatePreferences = (key: keyof UserSettings['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateSecuritySettings = (key: keyof UserSettings['security'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
    setHasChanges(true);
  };

  const exportData = () => {
    // Export user data functionality
    toast.success('Data export has been initiated. You will receive an email shortly.');
  };

  const deleteAccount = () => {
    // This would open a confirmation dialog
    toast.error('Account deletion requires additional verification. Please contact support.');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in to access settings</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
          </div>
          
          {hasChanges && (
            <Button onClick={saveSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {hasChanges && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have unsaved changes. Don't forget to save your settings!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about updates and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Communication Preferences</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(value) => updateNotificationSettings('email', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-xs text-gray-500">Browser and app notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(value) => updateNotificationSettings('push', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-xs text-gray-500">Text message alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(value) => updateNotificationSettings('sms', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Content Preferences</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <p className="text-xs text-gray-500">Status changes and tracking</p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={(value) => updateNotificationSettings('orderUpdates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Live Session Alerts</Label>
                    <p className="text-xs text-gray-500">New live shopping sessions</p>
                  </div>
                  <Switch
                    checked={settings.notifications.liveSessionAlerts}
                    onCheckedChange={(value) => updateNotificationSettings('liveSessionAlerts', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Price Drops</Label>
                    <p className="text-xs text-gray-500">Wishlist item discounts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.priceDrops}
                    onCheckedChange={(value) => updateNotificationSettings('priceDrops', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions & Offers</Label>
                    <p className="text-xs text-gray-500">Deals and special offers</p>
                  </div>
                  <Switch
                    checked={settings.notifications.promotions}
                    onCheckedChange={(value) => updateNotificationSettings('promotions', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <p className="text-xs text-gray-500">Weekly updates and tips</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newsletter}
                    onCheckedChange={(value) => updateNotificationSettings('newsletter', value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value: 'public' | 'private' | 'friends') => 
                      updatePrivacySettings('profileVisibility', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Purchase History</Label>
                    <p className="text-xs text-gray-500">Make your orders visible to others</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showPurchaseHistory}
                    onCheckedChange={(value) => updatePrivacySettings('showPurchaseHistory', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Wishlist</Label>
                    <p className="text-xs text-gray-500">Allow others to see your wishlist</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showWishlist}
                    onCheckedChange={(value) => updatePrivacySettings('showWishlist', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Collection</Label>
                    <p className="text-xs text-gray-500">Allow analytics and personalization</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowDataCollection}
                    onCheckedChange={(value) => updatePrivacySettings('allowDataCollection', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cookie Preferences</Label>
                    <p className="text-xs text-gray-500">Essential cookies only</p>
                  </div>
                  <Switch
                    checked={settings.privacy.cookiePreferences}
                    onCheckedChange={(value) => updatePrivacySettings('cookiePreferences', value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your shopping experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updatePreferences('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="ur">اردو (Urdu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => updatePreferences('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                      <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => updatePreferences('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updatePreferences('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-play Videos</Label>
                    <p className="text-xs text-gray-500">Automatically play product videos</p>
                  </div>
                  <Switch
                    checked={settings.preferences.autoPlayVideos}
                    onCheckedChange={(value) => updatePreferences('autoPlayVideos', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-xs text-gray-500">Minimize animations and effects</p>
                  </div>
                  <Switch
                    checked={settings.preferences.reducedMotion}
                    onCheckedChange={(value) => updatePreferences('reducedMotion', value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label>Two-Factor Authentication</Label>
                  {settings.security.twoFactorEnabled && (
                    <Badge variant="secondary" className="text-green-700 bg-green-100">Enabled</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={settings.security.twoFactorEnabled}
                onCheckedChange={(value) => updateSecuritySettings('twoFactorEnabled', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Login Alerts</Label>
                <p className="text-xs text-gray-500">Get notified of new device logins</p>
              </div>
              <Switch
                checked={settings.security.loginAlerts}
                onCheckedChange={(value) => updateSecuritySettings('loginAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Device Management</Label>
                <p className="text-xs text-gray-500">Monitor and manage logged-in devices</p>
              </div>
              <Switch
                checked={settings.security.deviceManagement}
                onCheckedChange={(value) => updateSecuritySettings('deviceManagement', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your account data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Export Data</Label>
                <p className="text-xs text-gray-500">Download a copy of your account data</p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Label className="text-red-900">Delete Account</Label>
                  <p className="text-xs text-red-700">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={deleteAccount} className="ml-4">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button at Bottom */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-lg border p-4 flex items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">You have unsaved changes</p>
              <p className="text-gray-500 text-xs">Don't forget to save your settings</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings(settings);
                  setHasChanges(false);
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Discard
              </Button>
              <Button size="sm" onClick={saveSettings} disabled={loading}>
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}