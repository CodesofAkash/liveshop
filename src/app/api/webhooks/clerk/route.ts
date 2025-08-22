import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, updateUser, deleteUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    // Get the body first
    const payload = await req.json()
    
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    let evt: WebhookEvent

    // Check if webhook secret is configured for verification
    const webhookSecret = process.env.WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SECRET
    
    if (webhookSecret && svix_id && svix_timestamp && svix_signature) {
      // If webhook secret is configured and headers are present, verify the webhook
      try {
        const body = JSON.stringify(payload)
        const wh = new Webhook(webhookSecret)
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        }) as WebhookEvent
        console.log('✅ Webhook signature verified')
      } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occurred - invalid signature', {
          status: 400,
        })
      }
    } else {
      // If no webhook secret or headers, use payload directly (development mode)
      console.log('⚠️ Running without webhook verification - using payload directly')
      evt = payload as WebhookEvent
    }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    if (!id || !email_addresses || email_addresses.length === 0) {
      console.error('Missing required user data in create event')
      return NextResponse.json(
        { error: 'Missing required user data' },
        { status: 400 }
      )
    }

    try {
      // Create user in database using utility function
      const user = await createUser({
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar: image_url || null,
        role: 'BUYER', // Default role
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'User created successfully',
        userId: user.id 
      })
    } catch (error) {
      console.error('Error creating user in database:', error)
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    if (!id) {
      console.error('Missing user ID in update event')
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    try {
      // Update user in database using utility function
      const user = await updateUser(id, {
        email: email_addresses?.[0]?.email_address || undefined,
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar: image_url || null,
      })

      console.log('User updated in database:', user)
      
      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully',
        userId: user.id 
      })
    } catch (error) {
      console.error('Error updating user in database:', error)
      return NextResponse.json(
        { error: 'Failed to update user in database' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      console.error('Missing user ID in delete event')
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    try {
      // Delete user from database using utility function
      await deleteUser(id)

      console.log('User deleted from database:', id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'User deleted successfully' 
      })
    } catch (error) {
      console.error('Error deleting user from database:', error)
      return NextResponse.json(
        { error: 'Failed to delete user from database' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Webhook received' 
  })
  
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
