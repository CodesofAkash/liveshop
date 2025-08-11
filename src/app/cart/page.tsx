'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  Tag,
  Truck,
  Shield,
  CreditCard,
  Heart,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

export default function ShoppingCartPage() {
  const router = useRouter();
  const { user } = useUser();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartItemsCount,
    getCartSubtotal
  } = useCartStore();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock promo codes for demo
  const availablePromoCodes: PromoCode[] = [
    {
      code: 'SAVE10',
      discount: 10,
      type: 'percentage',
      description: '10% off your order'
    },
    {
      code: 'FREESHIP',
      discount: 5.99,
      type: 'fixed',
      description: 'Free shipping'
    },
    {
      code: 'WELCOME20',
      discount: 20,
      type: 'percentage',
      description: '20% off for new customers'
    }
  ];

  const itemCount = getCartItemsCount();
  const subtotal = getCartSubtotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = subtotal * (appliedPromo.discount / 100);
    } else {
      discount = appliedPromo.discount;
    }
  }

  const total = subtotal + shipping + tax - discount;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    toast.success(`${itemName} removed from cart`);
  };

  const handleApplyPromoCode = () => {
    const promo = availablePromoCodes.find(
      p => p.code.toLowerCase() === promoCode.toLowerCase()
    );

    if (promo) {
      setAppliedPromo(promo);
      toast.success(`Promo code "${promo.code}" applied! ${promo.description}`);
      setPromoCode('');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

const handleCheckout = async () => {
  if (!user) {
    router.push('/sign-in?redirect_url=/cart');
    return;
  }

  if (items.length === 0) {
    toast.error('Your cart is empty');
    return;
  }

  setLoading(true);
  
  try {
    // Calculate proper subtotal
    const calculatedSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const calculatedShipping = calculatedSubtotal > 50 ? 0 : 5.99;
    const calculatedTax = calculatedSubtotal * 0.08;
    
    let calculatedDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        calculatedDiscount = calculatedSubtotal * (appliedPromo.discount / 100);
      } else {
        calculatedDiscount = appliedPromo.discount;
      }
    }

    const calculatedTotal = calculatedSubtotal + calculatedShipping + calculatedTax - calculatedDiscount;

    // Create order via API
    const orderData = {
      items: items.map(item => ({
        productId: item.product.id, // ✅ Use product ID, not cart item ID
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {}, // Add shipping address if needed
      paymentStatus: 'PENDING', // Add payment status
      // Remove these if API doesn't expect them:
      // subtotal: calculatedSubtotal,
      // shipping: calculatedShipping,
      // tax: calculatedTax,
      // discount: calculatedDiscount,
      // total: calculatedTotal,
      // promoCode: appliedPromo?.code
    };

    console.log('Sending order data:', orderData); // Debug log

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log('Order response:', result); // Debug log

    if (response.ok && result.success) {
      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/orders/${result.data.id}`);
    } else {
      toast.error(result.error || 'Failed to place order');
      console.error('Order creation failed:', result);
    }
  } catch (error) {
    toast.error('An error occurred while placing the order');
    console.error('Checkout error:', error);
  } finally {
    setLoading(false);
  }
};

  const saveForLater = (itemId: string, itemName: string) => {
    // In a real app, you'd save to wishlist via API
    removeItem(itemId);
    toast.success(`${itemName} moved to wishlist`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
              <p className="text-gray-600">
                Looks like you haven&#39;t added anything to your cart yet.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600">
              {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Cart Items</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearCart();
                      toast.success('Cart cleared');
                    }}
                  >
                    Clear Cart
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item?.product?.images?.[0] ?? '/vercel.svg'}
                        alt={item.product.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.product.title}</h3>
                      <p className="text-green-600 font-bold text-lg mb-2">
                        ${item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={!item.inStock}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={!item.inStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveForLater(item.id, item.product.title)}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Save for Later
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id, item.product.title)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!item.inStock && (
                        <Badge variant="destructive" className="mt-2">
                          Currently unavailable
                        </Badge>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">
                        {appliedPromo.code} applied!
                      </p>
                      <p className="text-sm text-green-600">
                        {appliedPromo.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePromoCode}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                    />
                    <Button onClick={handleApplyPromoCode}>
                      Apply
                    </Button>
                  </div>
                )}

                {!appliedPromo && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Available codes:</p>
                    <div className="flex flex-wrap gap-2">
                      {availablePromoCodes.map((promo) => (
                        <Badge
                          key={promo.code}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setPromoCode(promo.code);
                            handleApplyPromoCode();
                          }}
                        >
                          {promo.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading || items.some(item => !item.inStock)}
                  className="w-full h-12 text-lg"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                {subtotal < 50 && (
                  <p className="text-sm text-center text-gray-600">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Security & Features */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-green-500" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                  <span>30-day return policy</span>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}