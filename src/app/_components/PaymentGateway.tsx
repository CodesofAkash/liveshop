'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  error?: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, string>;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: RazorpayPaymentResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess?: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: RazorpayPaymentResponse) => void;
}

export default function PaymentGateway({
  orderId,
  amount,
  currency = 'INR',
  onSuccess,
  onFailure
}: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    try {
      setIsProcessing(true);
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create payment order
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, currency })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId: razorpayOrderId, amount: orderAmount, key, order } = await response.json();

      const options = {
        key: key,
        amount: orderAmount,
        currency: currency,
        name: 'LiveShop',
        description: `Order #${order.id}`,
        order_id: razorpayOrderId,
        handler: async function (response: RazorpayPaymentResponse) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();
            
            toast.success('Payment successful!', {
              description: 'Your order has been confirmed.'
            });

            if (onSuccess) {
              onSuccess(result);
            } else {
              router.push(`/orders/${orderId}/success`);
            }

          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            if (onFailure) {
              const errorResponse: RazorpayPaymentResponse = {
                razorpay_payment_id: '',
                razorpay_order_id: '',
                razorpay_signature: ''
              };
              onFailure(errorResponse);
            }
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          orderId: orderId
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: RazorpayPaymentResponse) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed', {
          description: response.error?.description || 'Unknown error'
        });
        if (onFailure) onFailure(response);
        setIsProcessing(false);
      });

      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      if (onFailure) {
        const errorResponse: RazorpayPaymentResponse = {
          razorpay_payment_id: '',
          razorpay_order_id: '',
          razorpay_signature: '',
          error: {
            code: 'INIT_ERROR',
            description: 'Failed to initiate payment',
            source: 'payment_gateway',
            step: 'initiation',
            reason: 'unknown',
            metadata: {}
          }
        };
        onFailure(errorResponse);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center">
          <div className="text-3xl font-bold">
            ₹{amount.toLocaleString('en-IN')}
          </div>
          <p className="text-muted-foreground">Order #{orderId.slice(-8)}</p>
        </div>

        <Separator />

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-medium">Select Payment Method</h4>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setPaymentMethod('razorpay')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Razorpay</div>
                  <div className="text-sm text-muted-foreground">
                    Cards, UPI, NetBanking, Wallets
                  </div>
                </div>
              </div>
              {paymentMethod === 'razorpay' && (
                <Badge variant="default">Selected</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Shield className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Payment Button */}
        <Button
          onClick={initiatePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}