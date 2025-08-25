'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Grid, List, Filter, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDbCartStore } from '@/lib/cart-store';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { WishlistTextButton } from '@/components/WishlistButton';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand?: string;
  inStock: boolean;
  inventory: number;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  createdAt: string;
}

interface CategoryInfo {
  name: string;
  description?: string;
  productCount: number;
  subcategories?: string[];
}

interface FilterOptions {
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { addItem } = useDbCartStore();
  
  // Decode the category from URL
  const category = decodeURIComponent(params.category as string);
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    priceRange: { min: 0, max: 10000 },
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>(searchParams.get('sort') as SortOption || 'relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const itemsPerPage = 12;

  // Fetch category products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        category: category,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortBy,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedBrands.length > 0) params.append('brands', selectedBrands.join(','));
      if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] < 10000) params.append('maxPrice', priceRange[1].toString());
      if (minRating > 0) params.append('minRating', minRating.toString());
      if (inStockOnly) params.append('inStock', 'true');

      const response = await fetch(`/api/categories/${encodeURIComponent(category)}?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data.products || []);
          setCategoryInfo(data.data.categoryInfo);
          setTotalProducts(data.data.totalCount || 0);
          setTotalPages(Math.ceil((data.data.totalCount || 0) / itemsPerPage));
          
          // Update filter options if available
          if (data.data.filterOptions) {
            setFilterOptions(data.data.filterOptions);
            // Update price range if not set
            if (priceRange[0] === 0 && priceRange[1] === 10000) {
              setPriceRange([data.data.filterOptions.priceRange.min, data.data.filterOptions.priceRange.max]);
            }
          }
        } else {
          setError(data.error || 'Failed to fetch products');
        }
      } else if (response.status === 404) {
        setError('Category not found');
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, sortBy, searchQuery, selectedBrands, priceRange, minRating, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle add to cart
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    try {
      await addItem(product.id, 1);
      toast.success(`Added ${product.title} to cart!`);
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  // Handle filter changes
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // Render product card
  const renderProductCard = (product: Product) => {
    const isListView = viewMode === 'list';
    return (
      <Card
        key={product.id}
        className={`group cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl bg-white flex ${
          isListView ? "flex-row items-center" : "flex-col"
        } overflow-hidden relative`}
      >
        {/* Wishlist Button in List View */}
        {isListView && (
          <div className="absolute top-4 right-4 z-10">
            <WishlistTextButton
              productId={product.id}
              className="bg-white/80 backdrop-blur-sm shadow"
            />
          </div>
        )}
        {/* IMAGE SECTION */}
        <div
          className={`relative bg-gray-50 ${
            isListView ? "w-48 min-w-48 h-48 flex items-center justify-center ml-8" : "w-full aspect-[4/3]"
          } overflow-hidden`}
        >
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            <Image
              src={product.images?.[0] || "/api/placeholder/300/300"}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              style={isListView ? { objectPosition: 'center' } : {}}
            />
            {product.inventory <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
            {/* Wishlist Button in Grid View */}
            {!isListView && (
              <WishlistTextButton
                productId={product.id}
                className="bg-white/80 absolute top-2 right-2 backdrop-blur-sm"
              />
            )}
          </Link>
        </div>

        {/* CONTENT */}
        <CardContent
          className={`flex flex-col justify-between p-4 ${
            isListView ? "flex-1" : ""
          }`}
        >
    <div>
      {/* BRAND */}
      {product.brand && (
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {product.brand}
        </p>
      )}

      {/* TITLE */}
      <Link href={`/products/${product.id}`}>
        <h3
          className={`font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 ${
            isListView ? "text-lg" : "leading-tight"
          }`}
        >
          {product.title}
        </h3>
      </Link>

      {/* DESCRIPTION (only in list view) */}
      {isListView && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* RATING */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(product.rating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {product.rating !== undefined ? product.rating.toFixed(1) : 0}
        </span>
        {product.reviewCount !== undefined && (
          <span className="text-xs text-gray-500">
            ({product.reviewCount})
          </span>
        )}
      </div>

      {/* TAGS */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags
            .slice(0, isListView ? 5 : 3)
            .map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>
      )}

      {/* DATE */}
      <p className="text-xs text-gray-500">
        Added{" "}
        {new Date(product.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>

    {/* PRICE + BUTTONS */}
    <div
      className={`flex items-center justify-between mt-4 w-full ${
        isListView ? "" : "flex-col gap-2 items-start"
      }`}
    >
      <span
        className={`font-bold text-green-600 ${
          isListView ? "text-xl" : "text-lg"
        }`}
      >
        ₹{product.price.toLocaleString("en-IN")}
      </span>

      <Button
        size={isListView ? "default" : "sm"}
        onClick={(e) => handleAddToCart(product, e)}
        disabled={!product.inStock}
        className={`${
          isListView ? "w-32" : "w-full"
        } flex items-center justify-center`}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isListView ? "Add to Cart" : "Add"}
      </Button>
    </div>
  </CardContent>
</Card>

    );
  };

  // Render filters sidebar
  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Search in Category</h3>
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={filterOptions.priceRange.max}
            min={filterOptions.priceRange.min}
            step={100}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatCurrency(priceRange[0])}</span>
            <span>{formatCurrency(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {filterOptions.brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterOptions.brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Minimum Rating</h3>
        <Select value={minRating.toString()} onValueChange={(value) => {setMinRating(parseInt(value)); setCurrentPage(1);}}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Rating</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock-only"
          checked={inStockOnly}
          onCheckedChange={(checked) => {setInStockOnly(checked as boolean); setCurrentPage(1);}}
        />
        <Label htmlFor="in-stock-only" className="text-sm cursor-pointer">
          In stock only
        </Label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-square bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-gray-800">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-800">{category}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{category}</h1>
          {categoryInfo?.description && (
            <p className="text-gray-600 mb-4">{categoryInfo.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{totalProducts} products found</span>
            {categoryInfo?.subcategories && categoryInfo.subcategories.length > 0 && (
              <div className="flex items-center gap-2">
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {categoryInfo.subcategories.map((sub, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <Filter className="h-5 w-5 text-gray-500" />
                </div>
                {renderFilters()}
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                {/* Mobile Filters */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filter Products</SheetTitle>
                        <SheetDescription>
                          Narrow down your search results
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        {renderFilters()}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: SortOption) => {setSortBy(value); setCurrentPage(1);}}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {products.map(renderProductCard)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}