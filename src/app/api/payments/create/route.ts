// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, currency = 'INR' } = await request.json();

    // Fetch order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
        status: 'PENDING'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Convert to paise
      currency: currency,
      receipt: `order_${order.id}`,
      notes: {
        orderId: order.id,
        userId: userId,
      },
    });

    // Update order with payment details
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: razorpayOrder.id,
      }
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        items: order.items,
        total: order.total,
        discount: order.discount,
        finalTotal: order.total - (order.discount || 0)
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}