// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: { notes?: { orderId?: string }; id: string }) {
  const orderId = payment.notes?.orderId;
  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        paymentId: payment.id,
      }
    });
  }
}

async function handlePaymentFailed(payment: { notes?: { orderId?: string }; id: string }) {
  const orderId = payment.notes?.orderId;
  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentId: payment.id,
      }
    });
  }
}

async function handleOrderPaid(order: { notes?: { orderId?: string } }) {
  const orderId = order.notes?.orderId;
  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
      }
    });
  }
}