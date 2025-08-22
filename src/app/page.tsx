'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useProductsStore, useUIStore, type Product } from '@/lib/store'
import { useDbCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Eye, 
  Play,
  TrendingUp,
  Users,
  RefreshCw,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Enhanced API Functions with better error handling and fallback
const fetchProducts = async (params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.append(key, value.toString())
    }
  })

  try {
    const response = await fetch(`/api/products?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: {
            products: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalCount: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: params.limit || 12
            }
          }
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    throw error
  }
}

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: [
            { name: 'Electronics', count: 0 },
            { name: 'Fashion', count: 0 },
            { name: 'Home', count: 0 },
            { name: 'Sports', count: 0 },
            { name: 'Books', count: 0 }
          ]
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch {
    return {
      success: true,
      data: [
        { name: 'Electronics', count: 0 },
        { name: 'Fashion', count: 0 },
        { name: 'Home', count: 0 },
        { name: 'Sports', count: 0 },
        { name: 'Books', count: 0 }
      ]
    }
  }
}

// Removed mock data - will show empty state when no products found

interface Category {
  name: string
  count: number
}

// Product Card Component
const ProductCard = ({ product, onClick, user }: { 
  product: Product; 
  onClick?: () => void;
  user: unknown;
}) => {
  const { addItem } = useDbCartStore()
  const addNotification = useUIStore((state) => state.addNotification)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick when adding to cart
    
    // This function will only be called for authenticated users
    if (!user) return
    
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.title} has been added to your cart`,
      })
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'}
            alt={product.title}
            width={300}
            height={192}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '300/192'
            }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90">
              {formatPrice(product.price)}
            </Badge>
          </div>
          {product.inventory < 20 && product.inventory > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">Low Stock</Badge>
            </div>
          )}
          {product.inventory === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
          {product.title}
        </CardTitle>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {product.rating ? product.rating.toFixed(1) : 'New'}
            </span>
          </div>
          <Badge variant="outline">{product.category}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{product.inventory} in stock</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-center">
        {user ? (
          <Button 
        onClick={handleAddToCart}
        disabled={product.inventory === 0 || isAdding}
        className="w-full group-hover:bg-primary/90 max-w-xs"
          >
        {isAdding ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        ) : (
          <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
        <SignInButton mode="modal">
          <Button 
            disabled={product.inventory === 0}
            className="w-full group-hover:bg-primary/90 max-w-xs"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </SignInButton>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

// Live Session Card Component
const LiveSessionCard = ({ session }: { session: { title: string; description: string; viewerCount: number } }) => {
  return (
    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-red-500 hover:bg-red-600">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </Badge>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {session.viewerCount}
          </div>
        </div>
        
        <h3 className="font-semibold mb-1">{session.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{session.description}</p>
        
        <Button size="sm" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Join Live
        </Button>
      </CardContent>
    </Card>
  )
}

// Enhanced Filter Component with debouncing
const FilterSection = () => {
  const { 
    searchQuery, 
    selectedCategory, 
    priceRange,
    setSearchQuery, 
    setSelectedCategory, 
    setPriceRange 
  } = useProductsStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, setSearchQuery])

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await fetchCategories()
        if (response.success) {
          setCategories(response.data)
        }
      } catch {
        // Error handling could be added here
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All
          </Button>
          {loadingCategories ? (
            <div className="flex gap-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="flex items-center space-x-1"
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm text-gray-600">Price:</span>
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0] || ''}
            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
            className="w-20"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1] === 999999 ? '' : priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 999999])}
            className="w-20"
          />
        </div>
      </div>
    </div>
  )
}

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 mb-12 rounded-lg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Welcome to <span className="text-yellow-300">LiveShop</span>
        </h1>
        <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
          Experience the future of shopping with live streaming, social features, and amazing deals
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="outline" className="text-purple-600 hover:bg-gray-100">
            <Eye className="h-5 w-5 mr-2" />
            Watch Live Sessions
          </Button>
          <Button size="lg" variant="outline" className="hover:bg-gray-100 text-purple-600">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending Products
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const ProductSkeleton = () => {
  return (
    <Card>
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-4 mb-3" />
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

// Error Component
const ErrorComponent = ({ message, onRetry }: { message: string; onRetry: () => void }) => {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <Button onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

// Main Homepage Component
export default function HomePage() {
  const { 
    filteredProducts, 
    loading, 
    error,
    searchQuery,
    selectedCategory,
    priceRange,
    setProducts, 
    setLoading,
    setError
  } = useProductsStore()
  
  const addNotification = useUIStore((state) => state.addNotification)
  const router = useRouter()
  const { user } = useUser()
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [usingMockData, setUsingMockData] = useState(false)

  // Mock live sessions
  const mockLiveSessions = [
    {
      id: 'live1',
      title: 'Tech Product Showcase',
      description: 'Latest gadgets and electronics',
      sellerId: 'seller1',
      isActive: true,
      viewerCount: 124,
    },
    {
      id: 'live2',
      title: 'Fashion Haul & Styling Tips',
      description: 'Summer collection preview',
      sellerId: 'seller3',
      isActive: true,
      viewerCount: 89,
    },
  ]

// Enhanced load products function
const loadProducts = useCallback(async (page = 1) => {
  setLoading(true)
  setError(null)
  
  try {
    const response = await fetchProducts({
      page,
      limit: 12,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 999999 ? priceRange[1] : undefined,
      sortBy,
      sortOrder,
    })

    const data = response;
    const products = data.data?.products || [];
    const pagination = data.data?.pagination;

    if (data.success && products && products.length > 0) {
      setProducts(products)
      if (pagination) {
        setPagination(pagination)
      }
      setUsingMockData(false)
      
      if (page === 1) {
        addNotification({
          type: 'success',
          title: 'Products Loaded',
          message: `Found ${pagination?.totalCount || products.length} products from database`,
        })
      }
    } else {
      // No products found - show empty state
      setProducts([])
      setUsingMockData(false)
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12
      })
      
      if (page === 1) {
        addNotification({
          type: 'info',
          title: 'No Products Found',
          message: searchQuery || selectedCategory ? 'Try adjusting your filters or search terms' : 'No products available yet',
        })
      }
    }
  } catch {
    // Show empty state on error
    setProducts([])
    setUsingMockData(false)
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 12
    })
    
    addNotification({
      type: 'error',
      title: 'Error Loading Products',
      message: 'Failed to load products. Please try again later.',
    })
  } finally {
    setLoading(false)
  }
}, [searchQuery, selectedCategory, priceRange, sortBy, sortOrder, setProducts, setLoading, setError, addNotification])

  // Load products on component mount and when filters change
  useEffect(() => {
    loadProducts(1)
  }, [loadProducts])

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (!usingMockData) {
      loadProducts(page)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle sorting
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Live Sessions Section */}
        {mockLiveSessions.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                Live Now
              </h2>
              <Button variant="outline">
                View All Sessions
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLiveSessions.map((session) => (
                <LiveSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <FilterSection />

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Products ({pagination.totalCount})
              {usingMockData && <span className="text-sm font-normal text-gray-500 ml-2">(Demo)</span>}
            </h2>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadProducts(pagination.currentPage)}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={loading}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
              </select>
            </div>
          </div>

          {error ? (
            <ErrorComponent 
              message={error} 
              onRetry={() => loadProducts(pagination.currentPage)} 
            />
          ) : loading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => router.push(`/products/${product.id}`)}
                    user={user}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">�</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No products are available yet. Be the first to add one!'
                }
              </p>
              <div className="flex justify-center gap-4">
                {(searchQuery || selectedCategory) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      useProductsStore.getState().setSearchQuery('')
                      useProductsStore.getState().setSelectedCategory('')
                      useProductsStore.getState().setPriceRange([0, 999999])
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {user ? (
                  <Button 
                    onClick={() => router.push('/products/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="mt-16 bg-white rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {pagination.totalCount.toLocaleString()}+
              </div>
              <div className="text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Sellers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600">Live Shopping</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}