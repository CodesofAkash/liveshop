'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Star,
  ShoppingBag,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    darkMode: boolean;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistItems: number;
    reviewsGiven: number;
    loyaltyPoints: number;
  };
  addresses: Array<{
    id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: user?.id || '',
    name: user?.fullName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: user?.phoneNumbers[0]?.phoneNumber || '',
    bio: '',
    location: '',
    dateOfBirth: '',
    preferences: {
      newsletter: true,
      notifications: true,
      darkMode: false,
    },
    stats: {
      totalOrders: 12,
      totalSpent: 2850.00,
      wishlistItems: 8,
      reviewsGiven: 15,
      loyaltyPoints: 420,
    },
    addresses: [
      {
        id: '1',
        type: 'Home',
        street: '123 Main Street, Apt 4B',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180001',
        country: 'India',
        isDefault: true,
      },
      {
        id: '2',
        type: 'Work',
        street: '456 Business Park',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180002',
        country: 'India',
        isDefault: false,
      },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'order',
        description: 'Ordered iPhone 15 Pro Max',
        date: '2 days ago',
      },
      {
        id: '2',
        type: 'review',
        description: 'Reviewed Sony WH-1000XM5 Headphones',
        date: '1 week ago',
      },
      {
        id: '3',
        type: 'wishlist',
        description: 'Added MacBook Pro to wishlist',
        date: '2 weeks ago',
      },
    ],
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  useEffect(() => {
    // Fetch user profile data from API
    // This would replace the mock data above
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/users/${user.id}/profile`);
      // const profileData = await response.json();
      // setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // API call to update profile
      // await fetch(`/api/users/${user?.id}/profile`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedProfile),
      // });
      
      setUserProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.imageUrl} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{userProfile.name}</CardTitle>
              <CardDescription>{userProfile.email}</CardDescription>
              <div className="flex justify-center gap-2 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {userProfile.stats.loyaltyPoints} Points
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{userProfile.stats.totalOrders}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">₹{userProfile.stats.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Spent</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center justify-center text-pink-600 mb-1">
                      <Heart className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-pink-600">{userProfile.stats.wishlistItems}</p>
                    <p className="text-xs text-gray-600">Wishlist</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center text-yellow-600 mb-1">
                      <Star className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{userProfile.stats.reviewsGiven}</p>
                    <p className="text-xs text-gray-600">Reviews</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {userProfile.recentActivity.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="text-sm">
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-gray-500 text-xs">{activity.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and preferences</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="addresses">Addresses</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={isEditing ? editedProfile.name : userProfile.name}
                          onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          value={userProfile.email}
                          disabled
                          className="pl-10 bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={isEditing ? editedProfile.phone || '' : userProfile.phone || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          value={isEditing ? editedProfile.location || '' : userProfile.location || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={isEditing ? editedProfile.dateOfBirth || '' : userProfile.dateOfBirth || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, dateOfBirth: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedProfile.bio || '' : userProfile.bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="space-y-4">
                  {userProfile.addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={address.isDefault ? "default" : "secondary"}>
                            {address.type}
                          </Badge>
                          {address.isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about your orders and account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.notifications}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, notifications: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Newsletter Subscription</h4>
                        <p className="text-sm text-gray-600">Get the latest updates and offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.newsletter}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, newsletter: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-gray-600">Use dark theme across the platform</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.darkMode}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, darkMode: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}