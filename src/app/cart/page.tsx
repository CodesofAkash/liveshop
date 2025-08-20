'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartSubtotal
  } = useCartStore();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Sample promo codes for demonstration
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

  // Calculate cart totals
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

  const applyPromoCode = () => {
    const promo = availablePromoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    
    if (promo) {
      setAppliedPromo(promo);
      setPromoCode('');
      toast.success(`Promo code "${promo.code}" applied! ${promo.description}`);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const removePromoCode = () => {
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

    // Apply any discount to the cart store if promo is applied
    if (appliedPromo) {
      let discountAmount = 0;
      if (appliedPromo.type === 'percentage') {
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        discountAmount = subtotal * (appliedPromo.discount / 100);
      } else {
        discountAmount = appliedPromo.discount;
      }
      
      // Apply discount to cart store
      const { applyDiscount } = useCartStore.getState();
      applyDiscount(appliedPromo.code, discountAmount);
    }

    // Redirect to checkout page
    router.push('/checkout');
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
                Looks like you haven&apos;t added anything to your cart yet.
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
            <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title || item.product.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 line-clamp-2">
                            {item.product.title || item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Category: {item.product.category}
                          </p>
                          <div className="flex items-center mt-2">
                            {item.inStock ? (
                              <Badge variant="secondary" className="text-green-600 bg-green-50">
                                <Shield className="h-3 w-3 mr-1" />
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                          <p className="text-sm text-gray-500">each</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={!item.inStock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveForLater(item.productId, item.product.title || item.product.name || 'Item')}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Item total:</span>
                          <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Cart Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => clearCart()}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promo Code Section */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim()}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{appliedPromo.code}</p>
                        <p className="text-sm text-green-600">
                          {appliedPromo.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromo?.code})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={items.some(item => !item.inStock)}
                    className="w-full py-3 text-lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  {items.some(item => !item.inStock) && (
                    <p className="text-sm text-red-600 text-center">
                      Some items are out of stock
                    </p>
                  )}
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-4 border-t">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Secure checkout with SSL encryption</span>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 2000 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Add {formatCurrency(2000 - subtotal)} more for free shipping!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page