'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/lib/store';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

// Consistent product interface
interface SearchProduct {
  id: string;
  name: string;
  title?: string; // For backwards compatibility
  description: string;
  price: number;
  images: string[];
  category: string;
  brand?: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  createdAt?: Date;
  status?: string;
  tags?: string[];
}

interface SearchFilters {
  category: string;
  brand: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

interface FilterOptions {
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
  ratings: Array<{ rating: number; count: number }>;
}

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
  'Automotive',
  'Toys',
];

const DEFAULT_BRANDS = [
  'Apple',
  'Samsung',
  'Nike',
  'Adidas',
  'Sony',
  'LG',
  'HP',
  'Dell',
  'Canon',
  'Nikon',
];

const DEFAULT_MAX_PRICE = 999999;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // State management
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: DEFAULT_MAX_PRICE },
    ratings: [],
  });

  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All Categories',
    brand: [],
    priceRange: [0, DEFAULT_MAX_PRICE],
    rating: 0,
    inStock: false,
    sortBy: 'relevance',
  });

  // Search function with improved error handling
  const searchProducts = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setProducts([]);
      setTotalResults(0);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '12',
        ...(filters.category !== 'All Categories' && { category: filters.category }),
        ...(filters.brand.length > 0 && { brand: filters.brand.join(',') }),
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        ...(filters.rating > 0 && { rating: filters.rating.toString() }),
        ...(filters.inStock && { inStock: 'true' }),
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Handle both new and legacy API response formats
      setProducts(data.products || []);
      setTotalResults(data.pagination?.totalResults || data.total || 0);
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
      
      // Update filter options if available
      if (data.filters) {
        setFilterOptions(data.filters);
      }

      // Show suggestions if no results
      if (data.suggestions && data.suggestions.length > 0) {
        console.log('Search suggestions:', data.suggestions);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search products. Please try again.');
      setProducts([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      router.push(newUrl);
      setCurrentPage(1);
      searchProducts(searchQuery.trim(), 1);
    }
  };

  // Update filters and trigger new search
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    if (searchQuery) {
      searchProducts(searchQuery, 1);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchProducts(searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      category: 'All Categories',
      brand: [],
      priceRange: [0, 10000],
      rating: 0,
      inStock: false,
      sortBy: 'relevance',
    };
    setFilters(clearedFilters);
    if (searchQuery) {
      searchProducts(searchQuery, 1);
    }
  };

  // Handle add to cart with proper product structure
  const handleAddToCart = (product: SearchProduct) => {
    const cartProduct = {
      id: product.id,
      title: product.name || product.title || 'Unknown Product',
      name: product.name || product.title || 'Unknown Product',
      price: product.price,
      images: product.images || [],
      inventory: product.inventory,
      category: product.category,
      description: product.description,
    };
    
    addItem(cartProduct);
    toast.success('Product added to cart!');
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All Categories') count++;
    if (filters.brand.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);

  // Effect to search when URL changes
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      searchProducts(query, 1);
    }
  }, [searchParams]);

  // Effect to search when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchProducts(searchQuery, currentPage);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="px-8" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </form>

          {/* Results Info & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-gray-300">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <>
                    {totalResults.toLocaleString()} results found
                    {searchQuery && (
                      <span className="ml-2">
                        for "<span className="font-semibold">{searchQuery}</span>"
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value as SearchFilters['sortBy'] })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-red-500 hover:text-red-600"
                        >
                          Clear All
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="sm:hidden"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="font-medium text-sm mb-3 block">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => updateFilters({ category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(filterOptions.categories.length > 0 ? filterOptions.categories.map(cat => cat.name) : DEFAULT_CATEGORIES).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="font-medium text-sm mb-3 block">Brand</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(filterOptions.brands.length > 0 ? filterOptions.brands : DEFAULT_BRANDS.map(brand => ({ name: brand, count: 0 }))).map((brand) => (
                          <div key={brand.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={brand.name}
                              checked={filters.brand.includes(brand.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFilters({ brand: [...filters.brand, brand.name] });
                                } else {
                                  updateFilters({ brand: filters.brand.filter(b => b !== brand.name) });
                                }
                              }}
                            />
                            <label htmlFor={brand.name} className="text-sm flex items-center gap-2">
                              {brand.name}
                              {typeof brand === 'object' && brand.count > 0 && (
                                <span className="text-xs text-gray-500">({brand.count})</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="font-medium text-sm mb-3 block">
                        Price Range: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
                      </label>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                        max={filterOptions.priceRange.max || DEFAULT_MAX_PRICE}
                        min={filterOptions.priceRange.min || 0}
                        step={100}
                        className="w-full"
                      />
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="font-medium text-sm mb-3 block">Minimum Rating</label>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rating-${rating}`}
                              checked={filters.rating === rating}
                              onCheckedChange={(checked) => {
                                updateFilters({ rating: checked ? rating : 0 });
                              }}
                            />
                            <label htmlFor={`rating-${rating}`} className="flex items-center text-sm">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2">& above</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
                      />
                      <label htmlFor="in-stock" className="text-sm font-medium">
                        In Stock Only
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-48 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => {
                    const productName = product.name || product.title || 'Unknown Product';
                    const productImage = product.images?.[0] || '/placeholder-product.jpg';
                    
                    return (
                      <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                        <CardContent className={`p-0 ${viewMode === 'list' ? 'flex' : ''}`}>
                          {/* Product Image */}
                          <div className={`relative ${
                            viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'
                          }`}>
                            <Link href={`/products/${product.id}`}>
                              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                                <Image
                                  src={productImage}
                                  alt={productName}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </Link>
                            
                            {/* Wishlist Button */}
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                                isInWishlist(product.id)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {/* Product Info */}
                          <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <Link href={`/products/${product.id}`}>
                                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                    {productName}
                                  </h3>
                                </Link>
                                {product.brand && (
                                  <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                                )}
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{product.price.toLocaleString()}
                              </span>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                              {product.inventory > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  In Stock ({product.inventory} left)
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                            </div>

                            {/* Description (List view only) */}
                            {viewMode === 'list' && product.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            {/* Add to Cart Button */}
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.inventory === 0}
                              className="w-full"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery ? 
                    `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.` :
                    'Start searching for products to see results here.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                  <Button onClick={() => router.push('/')}>
                    Browse All Products
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}