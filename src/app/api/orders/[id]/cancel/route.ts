import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orderId = params.id;
  try {
    // Update order status to cancelled
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
  }
}
