'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDbCartStore } from '@/lib/cart-store';
import EnhancedSearch from '@/app/_components/EnhancedSearch';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  inventory: number;
  rating?: number;
  reviewCount?: number;
  tags: string[];
}

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  minRating: number;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

const categories = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Books',
  'Beauty & Personal Care',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Accessories'
];

function SearchResultsContent() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { addItem } = useDbCartStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  const query = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || '';
  
  const [filters, setFilters] = useState<SearchFilters>({
    categories: category ? [category] : [],
    priceRange: [0, 1000],
    inStockOnly: false,
    minRating: 0,
    sortBy: 'relevance'
  });

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('categories', cat));
      }
      if (filters.inStockOnly) params.append('inStock', 'true');
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 1000) params.append('maxPrice', filters.priceRange[1].toString());
      params.append('sortBy', filters.sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Add mock rating and review data for demo
        const productsWithRatings = (data.products || []).map((product: Product) => ({
          ...product,
          rating: Math.random() * 2 + 3, // 3-5 star rating
          reviewCount: Math.floor(Math.random() * 100) + 10
        }));
        
        setProducts(productsWithRatings);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || productsWithRatings.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, filters, currentPage]);

  useEffect(() => {
    if (query || category) {
      fetchSearchResults();
    }
  }, [query, category, filters, currentPage, fetchSearchResults]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddToCart = (product: Product) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    
    addItem(product.id, 1);
    toast.success(`${product.title} added to cart!`);
  };

  const toggleWishlist = (productId: string) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to manage your wishlist');
      router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    
    const newWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist.add(productId);
      toast.success('Added to wishlist');
    }
    setWishlist(newWishlist);
  };

  const clearFilters = () => {
    setFilters({
      categories: category ? [category] : [],
      priceRange: [0, 1000],
      inStockOnly: false,
      minRating: 0,
      sortBy: 'relevance'
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title || 'Product image'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div 
          className="cursor-pointer" 
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">
                ({product.reviewCount})
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(product.price)}
            </span>
            <span className="text-sm text-gray-500">
              {product.inventory} in stock
            </span>
          </div>
        </div>
        
        <Button
          onClick={() => handleAddToCart(product)}
          disabled={!product.inStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-32 h-32 relative flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={product.imageUrl}
              alt={product.title || 'Product image'}
              fill
              sizes="128px"
              className="object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 
                  className="font-semibold text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {product.inventory} in stock
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <EnhancedSearch 
              placeholder="Search products..."
              className="max-w-2xl"
            />
          </div>
        </div>

        {/* Search Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {query ? `Search Results for "${query}"` : 
               category ? `${category} Products` : 
               'All Products'}
            </h1>
            <p className="text-gray-600">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select
              value={filters.sortBy}
              onValueChange={(value: string) => handleFilterChange({ sortBy: value as 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`w-64 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <Card>
              <CardContent className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={cat}
                          checked={filters.categories.includes(cat)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange({
                                categories: [...filters.categories, cat]
                              });
                            } else {
                              handleFilterChange({
                                categories: filters.categories.filter(c => c !== cat)
                              });
                            }
                          }}
                        />
                        <label htmlFor={cat} className="text-sm cursor-pointer">
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value: [number, number]) => 
                      handleFilterChange({ priceRange: value })
                    }
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}</span>
                  </div>
                </div>

                <Separator />

                {/* Availability */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStockOnly}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ inStockOnly: !!checked })
                      }
                    />
                    <label htmlFor="inStock" className="text-sm cursor-pointer">
                      In Stock Only
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Rating */}
                <div>
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={filters.minRating === rating}
                          onCheckedChange={(checked) =>
                            handleFilterChange({ minRating: checked ? rating : 0 })
                          }
                        />
                        <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1">& up</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                  No products found
                </h2>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}