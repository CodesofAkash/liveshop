// src/app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Share2, 
  Filter,
  Grid3X3,
  List,
  Star,
  Eye,
  Package,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { useCartStore, useUIStore } from '@/lib/store';
import RequireAuth from '@/components/RequireAuth';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistItem {
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
  addedDate: string;
  discount?: number;
  isOnSale?: boolean;
}

export default function WishlistPage() {
  const { addNotification } = useUIStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const { user } = useUser();
  const { addItem } = useCartStore();
  const { 
    items: wishlistItems, 
    loading, 
    error, 
    removeFromWishlist,
    isEmpty,
    refreshWishlist
  } = useWishlist();
    
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const success = await removeFromWishlist(productId);
      if (success) {
        toast.success('Item removed from wishlist');
      } else {
        toast.error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Extract category names and prepend 'all'
          const names = data.data.map((cat: { name: string }) => cat.name.toLowerCase());
          setCategories(['All', ...names]);
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchCategories();
  }, []);
  
  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      // If filterCategory is 'all' (case-insensitive), show all items
      return filterCategory.toLowerCase() === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
    });

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.inventory <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    try {
      const product = {
        id: item.productId,
        title: item.title,
        description: '', // Default empty description
        price: item.price,
        images: item.images || [],
        category: item.category,
        inventory: item.inventory,
        rating: item.rating,
        brand: item.brand,
        originalPrice: item.originalPrice,
        discount: item.discount,
        isOnSale: item.isOnSale
      };

      addItem(product, 1);
      toast.success(`${item.title} has been added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const shareWishlist = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My LiveShop Wishlist',
          text: 'Check out my wishlist on LiveShop!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Wishlist link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      toast.error('Failed to share wishlist');
    }
  };

  // Loading state
  if (loading) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your wishlist...</span>
          </div>
        </div>
      </RequireAuth>
    );
  }

  // Error state
  if (error) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-red-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load wishlist</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={refreshWishlist}>Try Again</Button>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-8 h-8 text-pink-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={shareWishlist} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Wishlist
                </Button>
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding items you love to your wishlist</p>
            <Button asChild>
              <Link href="/">
                <Package className="w-4 h-4 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* No items after filtering */}
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more items</p>
                <Button variant="outline" onClick={() => {
                  setFilterCategory('all');
                  setSortBy('newest');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Wishlist Items */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedItems.map((item) => (
                      <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="relative mb-4">
                            <Link href={`/products/${item.productId}`}>
                              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                                <Image
                                  src={item.images?.[0] || '/api/placeholder/300/300'}
                                  alt={item.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                />
                                {item.isOnSale && item.discount && (
                                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                                    {item.discount}% OFF
                                  </Badge>
                                )}
                                {item.inventory <= 0 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <Badge variant="secondary">Out of Stock</Badge>
                                  </div>
                                )}
                              </div>
                            </Link>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromWishlist(item.productId)}
                              className="absolute top-2 right-2 bg-white shadow-md hover:bg-red-50 hover:text-red-600"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {item.brand && (
                              <p className="text-xs text-gray-500 uppercase tracking-wider">{item.brand}</p>
                            )}
                            <Link href={`/products/${item.productId}`}>
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                {item.title}
                              </h3>
                            </Link>
                            
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(item.rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{item.rating !== undefined ? item.rating : 0}</span>
                              {item.reviewCount !== undefined && (
                                <span className="text-xs text-gray-500">({item.reviewCount})</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-500">
                              Added {new Date(item.addedDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={item.inventory <= 0 || loading}
                              className="flex-1"
                              size="sm"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {item.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="px-2"
                            >
                              <Link href={`/products/${item.productId}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <Link href={`/products/${item.productId}`}>
                              <div className="w-24 h-24 relative overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                                <Image
                                  src={item.images?.[0] || '/api/placeholder/300/300'}
                                  alt={item.title}
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-300"
                                  sizes="96px"
                                />
                                {item.isOnSale && item.discount && (
                                  <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs">
                                    {item.discount}% OFF
                                  </Badge>
                                )}
                              </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  {item.brand && (
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.brand}</p>
                                  )}
                                  <Link href={`/products/${item.productId}`}>
                                    <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                      {item.title}
                                    </h3>
                                  </Link>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromWishlist(item.productId)}
                                  className="hover:bg-red-50 hover:text-red-600 ml-2"
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-4 mb-3 flex-wrap">
                                {item.rating && (
                                  <div className="flex items-center gap-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(item.rating!) 
                                              ? 'fill-yellow-400 text-yellow-400' 
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{item.rating}</span>
                                    {item.reviewCount && (
                                      <span className="text-xs text-gray-500">({item.reviewCount} reviews)</span>
                                    )}
                                  </div>
                                )}
                                <Badge variant="outline" className="capitalize">{item.category}</Badge>
                                {item.inventory <= 0 && (
                                  <Badge variant="destructive">Out of Stock</Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xl font-bold text-gray-900">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{item.originalPrice.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    • Added {new Date(item.addedDate).toLocaleDateString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={`/products/${item.productId}`}>
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
                                  <Button
                                    onClick={() => handleAddToCart(item)}
                                    disabled={item.inventory <= 0 || loading}
                                    size="sm"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    {item.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Load More Section (if needed for pagination) */}
                {filteredAndSortedItems.length > 12 && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline">Load More Items</Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}