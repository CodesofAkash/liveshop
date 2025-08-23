// src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import RequireAuth from '@/components/RequireAuth';

import { 
  Package, 
  Search, 
  Filter,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Star,
  Download,
  Eye,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// TypeScript types must be outside the component

// Clerk modal type declaration for window
declare global {
  interface Window {
    Clerk?: {
      openSignIn: () => void;
    };
  }
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    brand?: string;
  }>;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderDate: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  canCancel: boolean;
  canReview: boolean;
}

// API response types
export type ApiOrderItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    brand?: string;
  };
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  items: ApiOrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderDate?: string;
  createdAt?: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  canCancel?: boolean;
  canReview?: boolean;
};


const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { color: 'bg-orange-100 text-orange-800', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  returned: { color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
};

export default function MyOrdersPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]); // filtered orders
  const [allOrders, setAllOrders] = useState<Order[]>([]); // all fetched orders
  // Pagination is available from API, but not used in UI yet

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '100'); // fetch all for user
        const res = await fetch(`/api/orders?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          const mappedOrders = (data.data as ApiOrder[]).map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: (order.status.toLowerCase() as Order['status']),
            items: order.items.map((item) => ({
              id: item.id,
              productId: item.product.id,
              name: item.product.title,
              image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.svg',
              price: item.product.price,
              quantity: item.quantity,
              brand: item.product.brand || '',
            })),
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: (order.paymentStatus.toLowerCase() as Order['paymentStatus']),
            shippingAddress: order.shippingAddress,
            orderDate: order.orderDate || order.createdAt || '',
            expectedDelivery: order.expectedDelivery,
            deliveredDate: order.deliveredDate,
            trackingNumber: order.trackingNumber,
            canCancel: order.canCancel ?? (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing'),
            canReview: order.canReview ?? (order.status.toLowerCase() === 'delivered'),
          }));
          setAllOrders(mappedOrders);
        } else {
          toast.error(data.error || 'Failed to fetch orders');
        }
      } catch {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Filter orders locally when statusFilter or searchQuery changes
  useEffect(() => {
    let filtered = allOrders;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      });
    }
    setOrders(filtered);
  }, [allOrders, statusFilter, searchQuery]);


  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });


  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return allOrders;
    return allOrders.filter(order => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      // Update both allOrders and orders state
      setAllOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled', canCancel: false }
          : order
      ));
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled', canCancel: false }
          : order
      ));
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  // Return functionality removed

  const downloadInvoice = (orderId: string) => {
    // Download invoice functionality
    toast.success(`Invoice download started for order ${orderId}`);
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Package className="w-8 h-8" />
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Clickable Order Status Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-8">
          {[
            { key: 'all', label: 'All Orders', color: 'text-black', count: allOrders.length, icon: <></> },
            { key: 'pending', label: 'Pending', color: 'text-yellow-600', count: getOrdersByStatus('pending').length, icon: <Clock className="mx-auto mb-1 text-yellow-500" /> },
            { key: 'confirmed', label: 'Confirmed', color: 'text-blue-600', count: getOrdersByStatus('confirmed').length, icon: <CheckCircle className="mx-auto mb-1 text-blue-500" /> },
            { key: 'processing', label: 'Processing', color: 'text-purple-600', count: getOrdersByStatus('processing').length, icon: <Package className="mx-auto mb-1 text-purple-500" /> },
            { key: 'shipped', label: 'Shipped', color: 'text-orange-600', count: getOrdersByStatus('shipped').length, icon: <Truck className="mx-auto mb-1 text-orange-500" /> },
            { key: 'delivered', label: 'Delivered', color: 'text-green-600', count: getOrdersByStatus('delivered').length, icon: <CheckCircle className="mx-auto mb-1 text-green-500" /> },
            { key: 'cancelled', label: 'Cancelled', color: 'text-red-600', count: getOrdersByStatus('cancelled').length, icon: <XCircle className="mx-auto mb-1 text-red-500" /> },
          ].map((status) => (
            <Card
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`cursor-pointer transition-shadow ${statusFilter === status.key ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            >
              <CardContent className="p-4 text-center">
                {status.icon}
                <div className={`text-sm ${status.key === 'all' ? 'text-gray-900 font-bold text-lg' : 'text-gray-600'}`}>{status.label}</div>
                <div className={`text-2xl font-bold ${status.color}`}>{status.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-pulse">
              <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading orders...</h2>
              <p className="text-gray-600 mb-8">Please wait while we fetch your orders.</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h2>
            <p className="text-gray-600 mb-8">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You don\'t have any orders yet. Make your first order to see it here!'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Package;
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Ordered on {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }) : '--'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <Badge className={statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <p className="text-lg font-bold">₹{order.total?.toLocaleString?.() ?? order.total}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 relative overflow-hidden rounded-md bg-white">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              priority={true}
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = '/placeholder.svg'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/products/${item.productId}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600">{item.brand}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                              <span className="text-sm font-medium">₹{item.price?.toLocaleString?.() ?? item.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Order Details */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tracking:</span>
                            <span className="font-medium font-mono">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.expectedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expected Delivery:</span>
                            <span className="font-medium">
                              {new Date(order.expectedDelivery).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        )}
                        {order.deliveredDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivered On:</span>
                            <span className="font-medium">
                              {new Date(order.deliveredDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Action Buttons */}
                      <div className="flex flex-col md:flex-row gap-2 md:items-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        {order.trackingNumber && order.status === 'shipped' && (
                          <Button variant="outline" size="sm">
                            <Truck className="w-4 h-4 mr-1" />
                            Track Order
                          </Button>
                        )}
                        {order.canReview && (
                          <Button variant="outline" size="sm">
                            <Star className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(order.id)}>
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                        {order.canCancel && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={loading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {/* Return button removed */}
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Support
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}