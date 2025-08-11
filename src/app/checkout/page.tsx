'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock,
  ArrowLeft,
  Check,
  AlertCircle,
  Truck,
  Shield,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

interface CheckoutFormData {
  // Shipping Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment Information
  paymentMethod: 'card' | 'razorpay' | 'cod';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  
  // Additional Options
  saveAddress: boolean;
  billingDifferent: boolean;
  specialInstructions: string;
  giftMessage: string;
}

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'India',
  'Australia',
  'Germany',
  'France',
  'Japan'
];

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, getCartTotal, getCartItemsCount, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveAddress: true,
    billingDifferent: false,
    specialInstructions: '',
    giftMessage: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [items, router]);

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.paymentMethod === 'cod') return true;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        subtotal,
        shipping,
        tax,
        total,
        specialInstructions: formData.specialInstructions,
        giftMessage: formData.giftMessage
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/${order.id}?success=true`);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/cart')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={`ml-2 mr-4 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Shipping
            </span>
            
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ml-4 ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={`ml-2 mr-4 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Payment
            </span>
            
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ml-4 ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
            <span className={`ml-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Review
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {usStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveAddress"
                      checked={formData.saveAddress}
                      onCheckedChange={(checked) => handleInputChange('saveAddress', checked)}
                    />
                    <Label htmlFor="saveAddress">Save this address for future orders</Label>
                  </div>

                  <Button onClick={handleNextStep} className="w-full">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <Label className="text-base font-medium">Payment Method</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value: any) => handleInputChange('paymentMethod', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Credit/Debit Card
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Pay with your credit or debit card</p>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Razorpay
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Pay via Razorpay gateway</p>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Cash on Delivery
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Card Details */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={errors.cardNumber ? 'border-red-500' : ''}
                        />
                        {errors.cardNumber && (
                          <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={errors.expiryDate ? 'border-red-500' : ''}
                          />
                          {errors.expiryDate && (
                            <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            className={errors.cvv ? 'border-red-500' : ''}
                          />
                          {errors.cvv && (
                            <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value)}
                          placeholder="John Doe"
                          className={errors.cardName ? 'border-red-500' : ''}
                        />
                        {errors.cardName && (
                          <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back to Shipping
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>{formData.firstName} {formData.lastName}</p>
                        <p>{formData.address}</p>
                        {formData.apartment && <p>{formData.apartment}</p>}
                        <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                        <p>{formData.country}</p>
                        <p>{formData.phone}</p>
                        <p>{formData.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="mt-2">
                        Edit Address
                      </Button>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <div className="flex items-center gap-2">
                        {formData.paymentMethod === 'card' && (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>•••• •••• •••• {formData.cardNumber.slice(-4)}</span>
                          </>
                        )}
                        {formData.paymentMethod === 'razorpay' && (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>Razorpay</span>
                          </>
                        )}
                        {formData.paymentMethod === 'cod' && (
                          <>
                            <Truck className="h-4 w-4" />
                            <span>Cash on Delivery</span>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="mt-2">
                        Edit Payment
                      </Button>
                    </div>

                    <Separator />

                    {/* Special Instructions */}
                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                        placeholder="Any special delivery instructions..."
                        rows={3}
                      />
                    </div>

                    {/* Gift Message */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-4 w-4" />
                        <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                      </div>
                      <Textarea
                        id="giftMessage"
                        value={formData.giftMessage}
                        onChange={(e) => handleInputChange('giftMessage', e.target.value)}
                        placeholder="Add a personal message for gift wrapping..."
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={processingPayment}
                      className="w-full h-12 text-lg"
                    >
                      {processingPayment ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Place Order • ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getCartItemsCount()} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>

                {subtotal < 50 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Why shop with us?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>1-year warranty on all products</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}