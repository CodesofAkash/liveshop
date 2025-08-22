// src/app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, CreditCard, Package, Truck, ArrowLeft } from 'lucide-react';
import { useDbCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent webpack issues
const PaymentGateway = dynamic(() => import('@/app/_components/PaymentGateway'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded" />
});

const OrderSummary = dynamic(() => import('@/app/_components/OrderSummary'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded" />
});

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, total, clearCart, fetchCart, loading } = useDbCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Form States
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Pricing
  const subtotal = total;
  const discountAmount = 0; // TODO: Implement discount functionality in DbCartStore
  const shippingFee = deliveryOption === 'express' ? 149 : (subtotal > 500 ? 0 : 49);
  const tax = Math.round((subtotal - discountAmount) * 0.18); // 18% GST
  const finalTotal = subtotal - discountAmount + shippingFee + tax;

  useEffect(() => {
    // Check authentication first
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/sign-in?redirect_url=/checkout');
      return;
    }
    
    // Fetch cart data when user is authenticated
    fetchCart();
  }, [user, fetchCart, router]);

  // Separate effect to check for empty cart after loading
  useEffect(() => {
    if (!loading && items.length === 0 && user) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [loading, items.length, user, router]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const missing = required.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (shippingAddress.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (shippingAddress.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const createOrder = async () => {
    if (!validateAddress()) return;
    
    setIsCreatingOrder(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId, // Use the actual product ID, not cart item ID
          quantity: item.quantity,
          price: item.price
        })),
        total: finalTotal,
        discount: discountAmount,
        shippingAddress,
        deliveryOption,
        notes: orderNotes,
        paymentMethod: 'RAZORPAY'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      console.log("order log: ", order)
      setOrderId(order.data.id);
      setCurrentStep(3);
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (result?: unknown) => {
    console.log('Payment success result:', result);
    console.log('OrderId for redirect:', orderId);
    clearCart();
    toast.success('Order placed successfully!');
    
    // Add a small delay to ensure everything is processed
    setTimeout(() => {
      router.push(`/orders/${orderId}/success`);
    }, 1000);
  };

  const handlePaymentFailure = (error: unknown) => {
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Cart is empty</h2>
            <Button onClick={() => router.push('/')}>Start Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, label: 'Address', icon: MapPin },
              { step: 2, label: 'Review', icon: Package },
              { step: 3, label: 'Payment', icon: CreditCard }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${currentStep >= step 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-muted bg-background text-muted-foreground'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
                {step < 3 && (
                  <div className={`mx-4 w-8 h-0.5 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="House no., Building name, Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Area, Colony (optional)"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={shippingAddress.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={shippingAddress.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Nearby landmark (optional)"
                    />
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-4">
                    <Label>Delivery Speed</Label>
                    <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="standard" id="standard" />
                        <div className="flex-1">
                          <Label htmlFor="standard" className="font-medium">
                            Standard Delivery (5-7 days)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {subtotal > 500 ? 'Free' : '₹49'}
                          </p>
                        </div>
                        <Truck className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="express" id="express" />
                        <div className="flex-1">
                          <Label htmlFor="express" className="font-medium">
                            Express Delivery (2-3 days)
                          </Label>
                          <p className="text-sm text-muted-foreground">₹149</p>
                        </div>
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveAddress"
                      checked={saveAddress}
                      onCheckedChange={(checked) => setSaveAddress(checked === true)}
                    />
                    <Label htmlFor="saveAddress" className="text-sm">
                      Save this address for future orders
                    </Label>
                  </div>

                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                    disabled={!validateAddress()}
                  >
                    Continue to Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Order Review */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Review Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Summary */}
                  <div>
                    <h4 className="font-medium mb-3">Shipping Address</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{shippingAddress.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {shippingAddress.addressLine1}
                        {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Phone: {shippingAddress.phone}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="mt-2"
                    >
                      Edit Address
                    </Button>
                  </div>

                  <Separator />

                  {/* Delivery Option */}
                  <div>
                    <h4 className="font-medium mb-2">Delivery Option</h4>
                    <Badge variant="outline">
                      {deliveryOption === 'express' ? 'Express Delivery (2-3 days)' : 'Standard Delivery (5-7 days)'}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Order Notes */}
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions for delivery"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={createOrder}
                    disabled={isCreatingOrder}
                    className="w-full"
                  >
                    {isCreatingOrder ? 'Creating Order...' : 'Proceed to Payment'}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Step 3: Payment */}
            {currentStep === 3 && orderId && (
              <PaymentGateway
                orderId={orderId}
                amount={finalTotal}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              discount={discountAmount}
              shipping={shippingFee}
              tax={tax}
              total={finalTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}