'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings,
  Star,
  Eye,
  Calendar,
  TrendingUp,
  Award,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  memberSince: string;
}

export default function UserDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'LS-2024-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 299.99,
          items: [
            {
              id: '1',
              name: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
            },
            {
              id: '2',
              name: 'Organic Cotton T-Shirt',
              price: 29.99,
              quantity: 2,
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'
            }
          ]
        },
        {
          id: '2',
          orderNumber: 'LS-2024-002',
          date: '2024-01-20',
          status: 'shipped',
          total: 149.99,
          items: [
            {
              id: '3',
              name: 'Smart Fitness Watch',
              price: 149.99,
              quantity: 1,
              imageUrl: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=200'
            }
          ]
        }
      ];

      const mockWishlist: WishlistItem[] = [
        {
          id: '4',
          name: 'Ceramic Coffee Mug Set',
          price: 49.99,
          imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200',
          category: 'Home & Kitchen',
          inStock: true
        },
        {
          id: '5',
          name: 'Leather Messenger Bag',
          price: 89.99,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
          category: 'Accessories',
          inStock: false
        }
      ];

      const mockStats: UserStats = {
        totalOrders: 12,
        totalSpent: 1299.87,
        loyaltyPoints: 1299,
        memberSince: '2023-06-15'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrders(mockOrders);
      setWishlist(mockWishlist);
      setUserStats(mockStats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/dashboard');
      return;
    }

    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn, user, router, fetchUserData]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 2000) return { level: 'Platinum', color: 'text-purple-600', progress: 100 };
    if (points >= 1000) return { level: 'Gold', color: 'text-yellow-600', progress: (points / 2000) * 100 };
    if (points >= 500) return { level: 'Silver', color: 'text-gray-600', progress: (points / 1000) * 100 };
    return { level: 'Bronze', color: 'text-orange-600', progress: (points / 500) * 100 };
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  const loyaltyInfo = getLoyaltyLevel(userStats?.loyaltyPoints || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">
                Manage your account and track your orders
              </p>
            </div>
          </div>
          
          {userStats && (
            <Card className="p-4">
              <div className="text-center">
                <div className={`text-lg font-semibold ${loyaltyInfo.color}`}>
                  {loyaltyInfo.level} Member
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {userStats.loyaltyPoints} points
                </div>
                <Progress value={loyaltyInfo.progress} className="w-24" />
              </div>
            </Card>
          )}
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{userStats.totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">{formatCurrency(userStats.totalSpent)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                    <p className="text-2xl font-bold">{userStats.loyaltyPoints}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                    <p className="text-2xl font-bold">
                      {new Date(userStats.memberSince).getFullYear()}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wishlist Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Wishlist ({wishlist.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wishlist.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                        </div>
                        <Badge variant={item.inStock ? "default" : "secondary"}>
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('wishlist')}>
                      View Full Wishlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                          <p className="text-gray-600">
                            Ordered on {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-lg font-semibold mt-2">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-gray-600">
                                Quantity: {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist ({wishlist.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(item.price)}
                          </span>
                          <Badge variant={item.inStock ? "default" : "secondary"}>
                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            disabled={!item.inStock}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saved Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="mb-2">Default</Badge>
                        <h3 className="font-semibold">Home Address</h3>
                        <p className="text-gray-600">
                          123 Main Street<br />
                          New York, NY 10001<br />
                          United States
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-gray-600">{user?.fullName}</p>
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Account
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">•••• •••• •••• 1234</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                      <Badge>Default</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}