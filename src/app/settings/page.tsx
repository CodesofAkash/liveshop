'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn) {
      loadSettings();
    }
  }, [isLoaded, isSignedIn, router]);

  const loadSettings = () => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your order status changes
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.orderUpdates}
                onChange={(e) => setSettings({ ...settings, orderUpdates: e.target.checked })}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Promotional Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about deals and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.promotionalEmails}
                onChange={(e) =>
                  setSettings({ ...settings, promotionalEmails: e.target.checked })
                }
                className="w-4 h-4"
              />
            </div>

            <Button onClick={saveSettings} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}