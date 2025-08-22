import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export interface CreateUserData {
  clerkId: string
  email: string
  name?: string | null
  avatar?: string | null
  role?: UserRole
  bio?: string | null
  phone?: string | null
}

export interface UpdateUserData {
  email?: string
  name?: string | null
  avatar?: string | null
  role?: UserRole
  bio?: string | null
  phone?: string | null
}

/**
 * Create a new user in the database
 */
export async function createUser(data: CreateUserData) {
  try {
    const user = await prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        role: data.role || 'BUYER',
        bio: data.bio,
        phone: data.phone,
      },
    })
    
    return user
  } catch {
    throw new Error('Failed to create user in database')
  }
}

/**
 * Update an existing user in the database
 */
export async function updateUser(clerkId: string, data: UpdateUserData) {
  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data,
    })
    
    return user
  } catch {
    throw new Error('Failed to update user in database')
  }
}

/**
 * Delete a user from the database
 */
export async function deleteUser(clerkId: string) {
  try {
    await prisma.user.delete({
      where: { clerkId },
    })
    
    return true
  } catch {
    throw new Error('Failed to delete user from database')
  }
}

/**
 * Get a user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        products: true,
        orders: true,
        liveSessions: true,
        reviews: true,
      },
    })
    
    return user
  } catch {
    throw new Error('Failed to fetch user from database')
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        products: true,
        orders: true,
        liveSessions: true,
        reviews: true,
      },
    })
    
    return user
  } catch {
    throw new Error('Failed to fetch user from database')
  }
}

/**
 * Check if a user exists by Clerk ID
 */
export async function userExists(clerkId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    
    return !!user
  } catch {
    return false
  }
}

/**
 * Sync user data from Clerk to database
 * This function can be called manually if needed
 */
export async function syncUserFromClerk(clerkUser: {
  id: string
  emailAddresses?: Array<{ emailAddress: string }>
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
}) {
  const userData: CreateUserData = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
    avatar: clerkUser.imageUrl || null,
    role: 'BUYER',
  }

  const exists = await userExists(clerkUser.id)
  
  if (exists) {
    return await updateUser(clerkUser.id, {
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
    })
  } else {
    return await createUser(userData)
  }
}
