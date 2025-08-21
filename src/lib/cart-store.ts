// src/lib/cart-store.ts
import { create } from 'zustand'

// Database Cart Types
export interface DbCartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    title: string
    description: string
    price: number
    imageUrl?: string
    images: string[]
    category: string
    inventory: number
    status: string
    inStock: boolean
    seller: {
      id: string
      name: string
      email: string
    }
  }
}

export interface DbCart {
  id: string
  userId: string
  items: DbCartItem[]
  createdAt: string
  updatedAt: string
}

interface DbCartState {
  // State
  cart: DbCart | null
  items: DbCartItem[]
  loading: boolean
  error: string | null
  isOpen: boolean
  
  // Computed values
  itemCount: number
  subtotal: number
  total: number
  
  // Actions
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  calculateTotals: () => void
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  clearState: () => void // For logout
}

export const useDbCartStore = create<DbCartState>((set, get) => ({
  // Initial state
  cart: null,
  items: [],
  loading: false,
  error: null,
  isOpen: false,
  itemCount: 0,
  subtotal: 0,
  total: 0,

  // Fetch cart from database
  fetchCart: async () => {
    try {
      set({ loading: true, error: null })
      
      const response = await fetch('/api/cart')
      const data = await response.json()
      
      if (data.success) {
        set({
          cart: data.data.cart,
          items: data.data.cart.items || [],
          itemCount: data.data.itemCount || 0,
          subtotal: data.data.subtotal || 0,
          total: data.data.total || 0,
          loading: false
        })
      } else {
        set({ error: data.error, loading: false })
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      set({ error: 'Failed to fetch cart', loading: false })
    }
  },

  // Add item to cart
  addItem: async (productId: string, quantity = 1) => {
    try {
      set({ loading: true, error: null })
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh cart after adding item
        await get().fetchCart()
      } else {
        set({ error: data.error, loading: false })
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      set({ loading: false })
      throw error
    }
  },

  // Update item quantity
  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      set({ loading: true, error: null })
      
      if (quantity <= 0) {
        await get().removeItem(itemId)
        return
      }
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state optimistically
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
          loading: false
        }))
        get().calculateTotals()
      } else {
        set({ error: data.error, loading: false })
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
      set({ loading: false })
      throw error
    }
  },

  // Remove item from cart
  removeItem: async (itemId: string) => {
    try {
      set({ loading: true, error: null })
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state optimistically
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
          loading: false
        }))
        get().calculateTotals()
      } else {
        set({ error: data.error, loading: false })
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
      set({ loading: false })
      throw error
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      set({ loading: true, error: null })
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        set({
          cart: null,
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
          loading: false
        })
      } else {
        set({ error: data.error, loading: false })
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      set({ loading: false })
      throw error
    }
  },

  // Calculate totals from current items
  calculateTotals: () => {
    const { items } = get()
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    
    set({
      subtotal,
      itemCount,
      total: subtotal, // Can add tax, shipping, etc. later
    })
  },

  // UI actions
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (isOpen) => set({ isOpen }),
  
  // Clear state on logout
  clearState: () => set({
    cart: null,
    items: [],
    loading: false,
    error: null,
    isOpen: false,
    itemCount: 0,
    subtotal: 0,
    total: 0,
  }),
}))
