// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Placeholder route - messages feature not yet implemented
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Messages feature not yet implemented' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Messages feature not yet implemented' },
    { status: 501 }
  );
}

/*
// Feature commented out for future implementation
// // src/app/api/messages/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { currentUser } from '@clerk/nextjs/server';

// // GET - Fetch user's messages/conversations
// export async function GET(request: NextRequest) {
//   try {
//     const user = await currentUser();
    
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const conversationId = searchParams.get('conversationId');
//     const type = searchParams.get('type'); // 'sent' | 'received' | 'all'

//     if (conversationId) {
//       // Get messages for a specific conversation
//       const messages = await prisma.message.findMany({
//         where: {
//           OR: [
//             { senderId: user.id },
//             { receiverId: user.id }
//           ],
//           // Add conversation grouping logic here if needed
//         },
//         include: {
//           sender: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               imageUrl: true,
//             }
//           },
//           receiver: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               imageUrl: true,
//             }
//           },
//           product: {
//             select: {
//               id: true,
//               title: true,
//               imageUrl: true,
//               price: true,
//             }
//           }
//         },
//         orderBy: {
//           createdAt: 'asc'
//         }
//       });

//       return NextResponse.json({
//         success: true,
//         data: messages
//       });
//     }

//     // Get all conversations for the user
//     const messages = await prisma.message.findMany({
//       where: {
//         OR: [
//           { senderId: user.id },
//           { receiverId: user.id }
//         ]
//       },
//       include: {
//         sender: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             imageUrl: true,
//           }
//         },
//         receiver: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             imageUrl: true,
//           }
//         },
//         product: {
//           select: {
//             id: true,
//             title: true,
//             imageUrl: true,
//             price: true,
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       },
//       take: 50 // Limit recent messages
//     });

//     return NextResponse.json({
//       success: true,
//       data: messages
//     });

//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch messages' },
//       { status: 500 }
//     );
//   }
// }

// // POST - Send a message to seller
// export async function POST(request: NextRequest) {
//   try {
//     const user = await currentUser();
    
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { sellerId, productId, message, subject } = body;

//     // Validate input
//     if (!sellerId) {
//       return NextResponse.json(
//         { success: false, error: 'Seller ID is required' },
//         { status: 400 }
//       );
//     }

//     if (!message || message.trim().length < 1) {
//       return NextResponse.json(
//         { success: false, error: 'Message cannot be empty' },
//         { status: 400 }
//       );
//     }

//     if (message.trim().length > 2000) {
//       return NextResponse.json(
//         { success: false, error: 'Message too long (max 2000 characters)' },
//         { status: 400 }
//       );
//     }

//     // Check if seller exists (assuming sellers are also users)
//     const seller = await prisma.user.findUnique({
//       where: { id: sellerId },
//       select: { id: true, firstName: true, lastName: true }
//     });

//     if (!seller) {
//       return NextResponse.json(
//         { success: false, error: 'Seller not found' },
//         { status: 404 }
//       );
//     }

//     // Check if product exists (if productId provided)
//     let product = null;
//     if (productId) {
//       product = await prisma.product.findUnique({
//         where: { id: productId },
//         select: { id: true, title: true, imageUrl: true, price: true }
//       });

//       if (!product) {
//         return NextResponse.json(
//           { success: false, error: 'Product not found' },
//           { status: 404 }
//         );
//       }
//     }

//     // Create message
//     const newMessage = await prisma.message.create({
//       data: {
//         senderId: user.id,
//         receiverId: sellerId,
//         message: message.trim(),
//         subject: subject?.trim() || null,
//         productId: productId || null,
//         messageType: 'INQUIRY',
//         status: 'SENT'
//       },
//       include: {
//         sender: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             imageUrl: true,
//           }
//         },
//         receiver: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             imageUrl: true,
//           }
//         },
//         product: {
//           select: {
//             id: true,
//             title: true,
//             imageUrl: true,
//             price: true,
//           }
//         }
//       }
//     });

//     // Here you could add notification logic to notify the seller
//     // For example, send email, push notification, etc.

//     return NextResponse.json({
//       success: true,
//       data: newMessage,
//       message: 'Message sent successfully'
//     }, { status: 201 });

//   } catch (error) {
//     console.error('Error sending message:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to send message' },
//       { status: 500 }
//     );
//   }
// }

// // PATCH - Mark message as read
// export async function PATCH(request: NextRequest) {
//   try {
//     const user = await currentUser();
    
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { messageId, action } = body;

//     if (!messageId) {
//       return NextResponse.json(
//         { success: false, error: 'Message ID is required' },
//         { status: 400 }
//       );
//     }

//     // Find the message
//     const message = await prisma.message.findUnique({
//       where: { id: messageId }
//     });

//     if (!message) {
//       return NextResponse.json(
//         { success: false, error: 'Message not found' },
//         { status: 404 }
//       );
//     }

//     // Check if user is receiver (can only mark received messages as read)
//     if (message.receiverId !== user.id) {
//       return NextResponse.json(
//         { success: false, error: 'Not authorized to modify this message' },
//         { status: 403 }
//       );
//     }

//     // Update message status
//     const updatedMessage = await prisma.message.update({
//       where: { id: messageId },
//       data: {
//         status: action === 'mark_read' ? 'READ' : 'SENT',
//         readAt: action === 'mark_read' ? new Date() : null
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       data: updatedMessage,
//       message: 'Message updated successfully'
//     });

//   } catch (error) {
//     console.error('Error updating message:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to update message' },
//       { status: 500 }
//     );
//   }
// }
*/