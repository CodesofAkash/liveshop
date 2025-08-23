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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Order {
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
    brand: string;
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
  canReturn: boolean;
  canReview: boolean;
}

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
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      items: [
        {
          id: '1',
          productId: 'prod-1',
          name: 'iPhone 15 Pro Max 256GB',
          image: '/api/placeholder/80/80',
          price: 134900,
          quantity: 1,
          brand: 'Apple',
        },
        {
          id: '2',
          productId: 'prod-2',
          name: 'MagSafe Charger',
          image: '/api/placeholder/80/80',
          price: 4500,
          quantity: 1,
          brand: 'Apple',
        },
      ],
      total: 139400,
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180001',
      },
      orderDate: '2024-01-15',
      deliveredDate: '2024-01-18',
      trackingNumber: 'TRK123456789',
      canCancel: false,
      canReturn: true,
      canReview: true,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      items: [
        {
          id: '3',
          productId: 'prod-3',
          name: 'MacBook Pro 14" M3',
          image: '/api/placeholder/80/80',
          price: 199900,
          quantity: 1,
          brand: 'Apple',
        },
      ],
      total: 199900,
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180001',
      },
      orderDate: '2024-01-20',
      expectedDelivery: '2024-01-25',
      trackingNumber: 'TRK987654321',
      canCancel: false,
      canReturn: false,
      canReview: false,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      items: [
        {
          id: '4',
          productId: 'prod-4',
          name: 'Sony WH-1000XM5 Headphones',
          image: '/api/placeholder/80/80',
          price: 29990,
          quantity: 1,
          brand: 'Sony',
        },
      ],
      total: 29990,
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180001',
      },
      orderDate: '2024-01-22',
      expectedDelivery: '2024-01-28',
      canCancel: true,
      canReturn: false,
      canReview: false,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      status: 'cancelled',
      items: [
        {
          id: '5',
          productId: 'prod-5',
          name: 'Samsung Galaxy S24 Ultra',
          image: '/api/placeholder/80/80',
          price: 124999,
          quantity: 1,
          brand: 'Samsung',
        },
      ],
      total: 124999,
      paymentMethod: 'Credit Card',
      paymentStatus: 'refunded',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Jammu',
        state: 'Jammu and Kashmir',
        zipCode: '180001',
      },
      orderDate: '2024-01-10',
      canCancel: false,
      canReturn: false,
      canReview: false,
    },
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      // API call would go here
      // await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const, canCancel: false }
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

  const handleReturnOrder = async (orderId: string) => {
    try {
      setLoading(true);
      // API call would go here
      // await fetch(`/api/orders/${orderId}/return`, { method: 'POST' });
      
      toast.success('Return request submitted successfully');
    } catch (error) {
      console.error('Error returning order:', error);
      toast.error('Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (orderId: string) => {
    // Download invoice functionality
    toast.success('Invoice download started');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your orders</h1>
          <p className="text-gray-600 mb-6">Track your purchases and manage your orders</p>
          <Button>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Package className="w-8 h-8" />
          My Orders
        </h1>
        <p className="text-gray-600">Track and manage your order history</p>
      </div>

      {/* Search and Filters */}
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
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getOrdersByStatus('delivered').length}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getOrdersByStatus('shipped').length}</div>
            <div className="text-sm text-gray-600">In Transit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{getOrdersByStatus('processing').length}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
          </h2>
          <p className="text-gray-600 mb-8">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start shopping to see your orders here'
            }
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
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ordered on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      <Badge className={statusConfig[order.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold">₹{order.total.toLocaleString()}</p>
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
                            <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
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

                      {order.canReturn && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReturnOrder(order.id)}
                          disabled={loading}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Return
                        </Button>
                      )}

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
  );
}