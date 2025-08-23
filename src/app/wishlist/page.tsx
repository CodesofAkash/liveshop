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
  Package
} from 'lucide-react';
import { toast } from 'sonner';

import { useUserStore, useCartStore, useUIStore } from '@/lib/store';

interface WishlistItem {
  id: string;
  productId: string;
  title: string; // Changed from 'name' to 'title' to match your Product interface
  price: number;
  originalPrice?: number;
  images?: string[]; // Changed to match your Product interface
  brand?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inventory: number; // Changed from 'inStock' to 'inventory' to match Product interface
  addedDate: string;
  discount?: number;
  isOnSale?: boolean;
}

export default function WishlistPage() {
  const { user } = useUser();
  const { addItem } = useCartStore(); // Fixed: using correct method from your store
  const { addNotification } = useUIStore(); // Fixed: using correct store
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      productId: 'prod-1',
      title: 'iPhone 15 Pro Max',
      price: 134900,
      originalPrice: 139900,
      images: ['/api/placeholder/300/300'],
      brand: 'Apple',
      category: 'Smartphones',
      rating: 4.8,
      reviewCount: 156,
      inventory: 10, // Changed from 'inStock: true'
      addedDate: '2024-01-15',
      discount: 4,
      isOnSale: true,
    },
    {
      id: '2',
      productId: 'prod-2',
      title: 'MacBook Pro 14" M3',
      price: 199900,
      images: ['/api/placeholder/300/300'],
      brand: 'Apple',
      category: 'Laptops',
      rating: 4.9,
      reviewCount: 89,
      inventory: 5,
      addedDate: '2024-01-10',
    },
    {
      id: '3',
      productId: 'prod-3',
      title: 'Sony WH-1000XM5',
      price: 29990,
      originalPrice: 34990,
      images: ['/api/placeholder/300/300'],
      brand: 'Sony',
      category: 'Audio',
      rating: 4.7,
      reviewCount: 234,
      inventory: 0, // Changed from 'inStock: false'
      addedDate: '2024-01-05',
      discount: 14,
      isOnSale: true,
    },
    {
      id: '4',
      productId: 'prod-4',
      title: 'Samsung Galaxy Watch 6',
      price: 32999,
      images: ['/api/placeholder/300/300'],
      brand: 'Samsung',
      category: 'Wearables',
      rating: 4.5,
      reviewCount: 78,
      inventory: 8,
      addedDate: '2024-01-02',
    },
  ]);

  const categories = ['all', 'smartphones', 'laptops', 'audio', 'wearables'];
  
  const filteredAndSortedItems = wishlistItems
    .filter(item => filterCategory === 'all' || item.category.toLowerCase() === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title); // Fixed: using 'title' instead of 'name'
        case 'rating':
          return (b.rating || 0) - (a.rating || 0); // Fixed: handling undefined rating
        case 'newest':
        default:
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
    });

  const removeFromWishlist = async (itemId: string) => {
    try {
      setLoading(true);
      // API call would go here
      // await fetch(`/api/wishlist/${itemId}`, { method: 'DELETE' });
      
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.inventory <= 0) { // Fixed: using inventory instead of inStock
      toast.error('Item is out of stock');
      return;
    }

    try {
      const product = {
        id: item.productId,
        title: item.title, // Fixed: using 'title' instead of 'name'
        description: '', // Added required field from your Product interface
        price: item.price,
        images: item.images,
        category: item.category,
        inventory: item.inventory, // Added required field
        rating: item.rating,
      };

      addItem(product, 1); // Fixed: using correct method signature from your store
      addNotification({
        type: 'success',
        title: 'Added to cart!',
        message: `${item.title} has been added to your cart`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({
        type: 'error', 
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    }
  };

  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My LiveShop Wishlist',
        text: 'Check out my wishlist on LiveShop!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Wishlist link copied to clipboard!');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-6">Create an account to save your favorite items</p>
          <Button>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
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
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={shareWishlist} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Wishlist
            </Button>
          </div>
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
              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            src={item.images?.[0] || '/api/placeholder/300/300'} // Fixed: using images array
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.isOnSale && item.discount && (
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                              {item.discount}% OFF
                            </Badge>
                          )}
                          {item.inventory <= 0 && ( // Fixed: using inventory
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Badge variant="secondary">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 bg-white shadow-md hover:bg-red-50 hover:text-red-600"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase">{item.brand}</p>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {item.title} {/* Fixed: using 'title' */}
                        </h3>
                      </Link>
                      
                      {item.rating && ( // Fixed: conditional rendering for rating
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{item.rating}</span>
                          <span className="text-xs text-gray-500">({item.reviewCount || 0})</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.inventory <= 0 || loading} // Fixed: using inventory
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {item.inventory > 0 ? 'Add to Cart' : 'Out of Stock'} {/* Fixed: using inventory */}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
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
                            src={item.images?.[0] || '/api/placeholder/300/300'} // Fixed: using images array
                            alt={item.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
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
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{item.brand}</p>
                            <Link href={`/products/${item.productId}`}>
                              <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                {item.title} {/* Fixed: using 'title' */}
                              </h3>
                            </Link>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          {item.rating && ( // Fixed: conditional rendering for rating
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{item.rating}</span>
                              <span className="text-xs text-gray-500">({item.reviewCount || 0} reviews)</span>
                            </div>
                          )}
                          <Badge variant="outline">{item.category}</Badge>
                          {item.inventory <= 0 && ( // Fixed: using inventory
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              • Added {new Date(item.addedDate).toLocaleDateString()}
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
                              disabled={item.inventory <= 0 || loading} // Fixed: using inventory
                              size="sm"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {item.inventory > 0 ? 'Add to Cart' : 'Out of Stock'} {/* Fixed: using inventory */}
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

          {/* Pagination would go here if needed */}
          {filteredAndSortedItems.length > 12 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline">Load More Items</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}