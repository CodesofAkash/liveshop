'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    title?: string;
    name?: string;
    images?: string[];
    image?: string;
    brand?: string;
  };
}

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  promoCode?: string;
}

export default function OrderSummary({
  items,
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  promoCode
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                <img
                  src={(item.product.images && item.product.images[0]) || item.product.image || '/placeholder.jpg'}
                  alt={item.product.title || item.product.name || 'Product'}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.product.title || item.product.name}</h4>
                {item.product.brand && (
                  <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                )}
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <div className="font-medium">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({items.length} items)</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Discount {promoCode && `(${promoCode})`}
              </span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          
          {shipping > 0 && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{shipping.toLocaleString('en-IN')}</span>
            </div>
          )}
          
          {tax > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </CardContent>
    </Card>
  );
}