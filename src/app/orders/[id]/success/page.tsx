// src/app/orders/[id]/success/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Download, Home, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  status: string;
  total: number;
  discount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
      images: string[];
      brand?: string;
    };
  }[];
  shippingAddress?: Record<string, unknown>;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      
      const result = await response.json();
      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Order not found</h2>
            <Button onClick={() => router.push('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your order has been confirmed and will be processed shortly.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge 
                    variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="font-medium">
                    {order.paidAt 
                      ? new Date(order.paidAt).toLocaleString('en-IN')
                      : 'Processing'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              {/* Order Timeline */}
              <div className="space-y-3">
                <h4 className="font-medium">Order Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Payment Confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Processing Order</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">Shipping (Expected in 2-3 days)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/placeholder.jpg'}
                        alt={item.product.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product.title}</h4>
                      {item.product.brand && (
                        <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                      )}
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                )) || []}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(order.total + order.discount).toLocaleString('en-IN')}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            <Package className="w-4 h-4 mr-2" />
            Track Your Order
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-2">Order Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Your order is being prepared and will be packed within 24 hours.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium mb-2">Shipping</h4>
                <p className="text-sm text-muted-foreground">
                  Your order will be shipped within 2-3 business days. Track your package anytime.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-2">Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Enjoy your new products! Contact us if you have any questions.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                📧 Order confirmation and tracking details have been sent to your email.
                <br />
                📱 You can also track your order in your dashboard anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}