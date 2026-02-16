'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
  });

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchProfile();
    } else if (isLoaded && !clerkUser) {
      router.push('/sign-in');
    }
  }, [isLoaded, clerkUser, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/${clerkUser?.id}`);
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
        setFormData({
          name: data.data.name || '',
          bio: data.data.bio || '',
          phone: data.data.phone || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/user/${clerkUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        setUserData(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt={clerkUser.fullName || 'User'}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <h2 className="text-xl font-bold mb-1">
                  {userData?.name || clerkUser?.fullName || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {clerkUser?.emailAddresses[0]?.emailAddress}
                </p>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData?._count?.orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData?._count?.reviews || 0}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData?._count?.wishlist || 0}</p>
                    <p className="text-xs text-muted-foreground">Wishlist</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData?._count?.products || 0}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}