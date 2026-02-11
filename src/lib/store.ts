// src/lib/store.ts - Enhanced with Analytics
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types (keeping your existing structure)
export interface User {
  id: string
  email: string
  name: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  avatar?: string
  clerkId: string // Added for Clerk integration
}

export interface Product {
  id: string
  title: string
  name: string
  brand: string
  description: string
  price: number
  images: string[]
  category: string
  sellerId?: string
  inventory: number
  rating?: number
  reviewCount?: number
  createdAt?: Date
  updatedAt?: Date
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  inStock?: boolean
  featured?: boolean
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  inStock: boolean
}

export interface Order {
  id: string
  buyerId: string // Updated to match MongoDB schema
  orderNumber?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'CANCELLED' | 'REFUNDED'
  createdAt: Date
  updatedAt: Date
}

export interface LiveSession {
  id: string
  title: string
  description: string
  sellerId: string
  isActive: boolean
  viewerCount: number
  scheduledAt?: Date
}

// Analytics Types
export interface AnalyticsData {
  revenue: {
    total: number
    growth: number
    data: Array<{ date: string; revenue: number }>
  }
  orders: {
    total: number
    growth: number
    data: Array<{ date: string; orders: number }>
  }
  customers: {
    total: number
    returning: number
    new: number
  }
  products: {
    total: number
    topPerforming: Array<{
      id: string
      title: string
      revenue: number
      orders: number
      views: number
      conversion: number
    }>
    categoryBreakdown: Array<{
      category: string
      revenue: number
      orders: number
      products: number
    }>
  }
  traffic: {
    totalViews: number
    uniqueVisitors: number
    avgSessionTime: string
    bounceRate: number
    data: Array<{ date: string; views: number; visitors: number }>
  }
  conversion: {
    rate: number
    data: Array<{ date: string; rate: number }>
  }
}

export interface RealtimeAnalytics {
  today: {
    views: number
    orders: number
    revenue: number
    activeVisitors: number
  }
  growth: {
    views: number
    orders: number
  }
  lastHour: {
    views: number
  }
  hourlyBreakdown: Array<{
    hour: number
    views: number
    orders: number
  }>
}

export type TimeRange = '7d' | '30d' | '90d' | '1y'

// Your existing stores (keeping unchanged)
interface UserState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

interface ProductsState {
  products: Product[]
  filteredProducts: Product[]
  searchQuery: string
  selectedCategory: string
  priceRange: [number, number]
  loading: boolean
  error: string | null
  
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setPriceRange: (range: [number, number]) => void
  filterProducts: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  filteredProducts: [],
  searchQuery: '',
  selectedCategory: '',
  priceRange: [0, 999999],
  loading: false,
  error: null,

  setProducts: (products) => {
    set({ products })
    get().filterProducts()
  },

  addProduct: (product) => {
    set((state) => ({ products: [...state.products, product] }))
    get().filterProducts()
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    }))
    get().filterProducts()
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }))
    get().filterProducts()
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
    get().filterProducts()
  },

  setSelectedCategory: (selectedCategory) => {
    set({ selectedCategory })
    get().filterProducts()
  },

  setPriceRange: (priceRange) => {
    set({ priceRange })
    get().filterProducts()
  },

  filterProducts: () => {
    const { products, searchQuery, selectedCategory, priceRange } = get()
    
    const filtered = products.filter((product) => {
      const productName = product.title || product.name || ''
      const matchesSearch = !searchQuery || 
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      
      return matchesSearch && matchesCategory && matchesPrice
    })
    
    set({ filteredProducts: filtered })
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
  discount: number
  discountCode: string | null
  
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
  getCartItemsCount: () => number
  getCartSubtotal: () => number
  getCartTotal: () => number
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  applyDiscount: (code: string, amount: number) => void
  removeDiscount: () => void
  setDiscount: (amount: number) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isOpen: false,
      discount: 0,
      discountCode: null,

      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find((item) => item.productId === product.id)

        if (existingItem) {
          get().updateQuantity(product.id, existingItem.quantity + quantity)
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            price: product.price,
            inStock: product.inventory > 0,
          }
          set((state) => ({ items: [...state.items, newItem] }))
        }
        get().calculateTotals()
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
        get().calculateTotals()
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }))
        get().calculateTotals()
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0, discount: 0, discountCode: null })
      },

      calculateTotals: () => {
        const { items } = get()
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
        set({ total, itemCount })
      },

      getCartItemsCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      getCartSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getCartTotal: () => {
        const { items, discount } = get()
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
        return Math.max(0, subtotal - discount)
      },

      applyDiscount: (code, amount) => {
        set({ discount: amount, discountCode: code })
        get().calculateTotals()
      },

      removeDiscount: () => {
        set({ discount: 0, discountCode: null })
        get().calculateTotals()
      },

      setDiscount: (amount) => {
        set({ discount: amount })
        get().calculateTotals()
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

interface LiveState {
  activeSessions: LiveSession[]
  currentSession: LiveSession | null
  isConnected: boolean
  viewerCount: number
  chatMessages: Array<{
    id: string
    userId: string
    userName: string
    message: string
    timestamp: Date
  }>
  
  setActiveSessions: (sessions: LiveSession[]) => void
  setCurrentSession: (session: LiveSession | null) => void
  setIsConnected: (connected: boolean) => void
  setViewerCount: (count: number) => void
  addChatMessage: (message: {
    id: string
    userId: string
    userName: string
    message: string
    timestamp: Date
  }) => void
  clearChat: () => void
}

export const useLiveStore = create<LiveState>((set) => ({
  activeSessions: [],
  currentSession: null,
  isConnected: false,
  viewerCount: 0,
  chatMessages: [],

  setActiveSessions: (activeSessions) => set({ activeSessions }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
    
  clearChat: () => set({ chatMessages: [] }),
}))

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: {
    global: boolean
    products: boolean
    orders: boolean
    live: boolean
    analytics: boolean // Added analytics loading state
  }
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }>
  
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: false,
      loading: {
        global: false,
        products: false,
        orders: false,
        live: false,
        analytics: false,
      },
      notifications: [],

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading },
        })),

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
        }
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))
        
        setTimeout(() => {
          get().removeNotification(newNotification.id)
        }, 5000)
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  setCurrentOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  setCurrentOrder: (currentOrder) => set({ currentOrder }),
  setLoading: (loading) => set({ loading }),
}))

// NEW: Analytics Store
interface AnalyticsState {
  data: AnalyticsData | null
  realtimeData: RealtimeAnalytics | null
  timeRange: TimeRange
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  setAnalyticsData: (data: AnalyticsData) => void
  setRealtimeData: (data: RealtimeAnalytics) => void
  setTimeRange: (range: TimeRange) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdated: (date: Date) => void
  clearData: () => void
  
  // Computed values
  getRevenueTrend: () => 'up' | 'down' | 'neutral'
  getTopCategory: () => string | null
  getConversionTrend: () => 'up' | 'down' | 'neutral'
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: null,
  realtimeData: null,
  timeRange: '30d',
  loading: false,
  error: null,
  lastUpdated: null,

  setAnalyticsData: (data) => set({ data, lastUpdated: new Date() }),
  setRealtimeData: (realtimeData) => set({ realtimeData }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  clearData: () => set({ data: null, realtimeData: null, error: null }),

  getRevenueTrend: () => {
    const { data } = get()
    if (!data?.revenue.growth) return 'neutral'
    return data.revenue.growth > 0 ? 'up' : data.revenue.growth < 0 ? 'down' : 'neutral'
  },

  getTopCategory: () => {
    const { data } = get()
    if (!data?.products.categoryBreakdown.length) return null
    return data.products.categoryBreakdown.sort((a, b) => b.revenue - a.revenue)[0].category
  },

  getConversionTrend: () => {
    const { data } = get()
    if (!data?.conversion.data.length) return 'neutral'
    const recent = data.conversion.data.slice(-7)
    const older = data.conversion.data.slice(-14, -7)
    if (recent.length === 0 || older.length === 0) return 'neutral'
    
    const recentAvg = recent.reduce((sum, item) => sum + item.rate, 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item.rate, 0) / older.length
    
    return recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'neutral'
  },
}))

// Export all stores
export const stores = {
  useUserStore,
  useProductsStore,
  useCartStore,
  useLiveStore,
  useUIStore,
  useOrdersStore,
  useAnalyticsStore, // Added analytics store
}