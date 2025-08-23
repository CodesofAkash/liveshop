// src/hooks/useWishlist.ts
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUIStore } from '@/lib/store';

// Raw API response interface
export interface ApiWishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    images?: string[];
    category: string;
    inventory: number;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    status: string;
    sellerId?: string;
    discount?: number;
    isOnSale?: boolean;
  };
}

// Flattened wishlist item interface for easier use in components
export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  brand?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inventory: number;
  addedDate: string; // ISO date string
  discount?: number;
  isOnSale?: boolean;
  description?: string;
  status?: string;
  sellerId?: string;
}

export interface UseWishlistReturn {
  // State
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  
  // Computed values
  wishlistCount: number;
  isEmpty: boolean;
}

// Transform API response to flattened structure
function transformWishlistItem(apiItem: ApiWishlistItem): WishlistItem {
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    title: apiItem.product.title,
    price: apiItem.product.price,
    originalPrice: apiItem.product.originalPrice,
    images: apiItem.product.images,
    brand: apiItem.product.brand,
    category: apiItem.product.category,
    rating: apiItem.product.rating,
    reviewCount: apiItem.product.reviewCount,
    inventory: apiItem.product.inventory,
    addedDate: apiItem.createdAt,
    discount: apiItem.product.discount,
    isOnSale: apiItem.product.isOnSale,
    description: apiItem.product.description,
    status: apiItem.product.status,
    sellerId: apiItem.product.sellerId,
  };
}

export function useWishlist(): UseWishlistReturn {
  const { user, isLoaded } = useUser();
  const { addNotification } = useUIStore();
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!user || !isLoaded) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Transform API items to flattened structure
        const transformedItems = data.data.map((apiItem: ApiWishlistItem) => 
          transformWishlistItem(apiItem)
        );
        setItems(transformedItems);
      } else if (data.success) {
        // Handle empty wishlist
        setItems([]);
      } else {
        throw new Error(data.error || 'Failed to fetch wishlist');
      }
      
    } catch (err: any) {
      console.error('Wishlist fetch error:', err);
      const errorMessage = err.message || 'Failed to load wishlist';
      setError(errorMessage);
      
      // Only show notification for non-network errors to avoid spam
      if (!errorMessage.includes('fetch')) {
        addNotification({
          type: 'error',
          title: 'Wishlist Error',
          message: 'Could not load your wishlist. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded, addNotification]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to add items to your wishlist'
      });
      return false;
    }

    if (isInWishlist(productId)) {
      addNotification({
        type: 'info',
        title: 'Already Added',
        message: 'This item is already in your wishlist'
      });
      return false;
    }

    try {
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        // Add the new item to local state
        if (data.data) {
          const newItem = transformWishlistItem(data.data);
          setItems(prev => [newItem, ...prev]);
        } else {
          // Fallback: refresh the entire wishlist
          await fetchWishlist();
        }

        addNotification({
          type: 'success',
          title: 'Added to Wishlist',
          message: data.message || 'Item added to your wishlist'
        });
        
        return true;
      } else {
        throw new Error(data.error || 'Failed to add item');
      }
      
    } catch (err: any) {
      console.error('Add to wishlist error:', err);
      const errorMessage = err.message || 'Could not add item to wishlist';
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Wishlist Error',
        message: errorMessage
      });
      
      return false;
    }
  }, [user, isInWishlist, fetchWishlist, addNotification]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to manage your wishlist'
      });
      return false;
    }

    if (!isInWishlist(productId)) {
      addNotification({
        type: 'info',
        title: 'Item Not Found',
        message: 'This item is not in your wishlist'
      });
      return false;
    }

    // Optimistically update UI
    const originalItems = items;
    setItems(prev => prev.filter(item => item.productId !== productId));

    try {
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert optimistic update
        setItems(originalItems);
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Removed from Wishlist',
          message: data.message || 'Item removed from your wishlist'
        });
        
        return true;
      } else {
        // Revert optimistic update
        setItems(originalItems);
        throw new Error(data.error || 'Failed to remove item');
      }
      
    } catch (err: any) {
      console.error('Remove from wishlist error:', err);
      const errorMessage = err.message || 'Could not remove item from wishlist';
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Wishlist Error',
        message: errorMessage
      });
      
      return false;
    }
  }, [user, items, isInWishlist, addNotification]);

  // Toggle item in wishlist
  const toggleWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Refresh wishlist
  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  // Load wishlist when user changes
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchWishlist();
      } else {
        // Clear wishlist when user logs out
        setItems([]);
        setError(null);
      }
    }
  }, [user, isLoaded, fetchWishlist]);

  // Clear error when items change (successful operation)
  useEffect(() => {
    if (error && items.length >= 0) {
      setError(null);
    }
  }, [items.length, error]);

  return {
    // State
    items,
    loading,
    error,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,
    
    // Computed values
    wishlistCount: items.length,
    isEmpty: items.length === 0,
  };
}

// Additional utility hook for wishlist button state
export function useWishlistButton(productId: string) {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const { user, isLoaded } = useUser();
  
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggle = useCallback(async (e?: React.MouseEvent) => {
    // Prevent event bubbling if called from within a link
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      // Could trigger a sign-in modal here
      return false;
    }
    
    if (isToggling) return false;
    
    try {
      setIsToggling(true);
      const success = await toggleWishlist(productId);
      return success;
    } finally {
      setIsToggling(false);
    }
  }, [productId, toggleWishlist, user, isToggling]);

  return {
    isWishlisted: isInWishlist(productId),
    isLoading: loading || isToggling,
    isAuthenticated: !!user && isLoaded,
    isReady: isLoaded,
    toggle: handleToggle,
  };
}

// Hook for getting a specific wishlist item
export function useWishlistItem(productId: string) {
  const { items, isInWishlist, loading } = useWishlist();
  
  const item = items.find(item => item.productId === productId);
  
  return {
    item: item || null,
    isInWishlist: isInWishlist(productId),
    loading,
  };
}

// Hook for wishlist statistics
export function useWishlistStats() {
  const { items, loading } = useWishlist();
  
  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
    averagePrice: items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0,
    categoryCounts: items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    outOfStockCount: items.filter(item => item.inventory <= 0).length,
    onSaleCount: items.filter(item => item.isOnSale).length,
  };
  
  return {
    stats,
    loading,
  };
}