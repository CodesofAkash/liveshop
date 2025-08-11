'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Star,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  price: number
  inventory: number
  status: string
  images: string[]
  rating: number
  reviewCount: number
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  items: Array<{
    id: string
    quantity: number
    product: {
      title: string
      price: number
    }
  }>
  createdAt: string
  buyer: {
    name: string
    email: string
  }
}

interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalViews: number
  revenueGrowth: number
  ordersGrowth: number
  topSellingProducts: Array<{
    id: string
    title: string
    sales: number
    revenue: number
  }>
  recentOrders: Order[]
}

export default function SellerDashboard() {
  const { userId } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch products
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      
      // Fetch orders
      const ordersRes = await fetch('/api/orders')
      const ordersData = await ordersRes.json()
      
      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics')
      const analyticsData = await analyticsRes.json()

      if (productsData.success) setProducts(productsData.data)
      if (ordersData.success) setOrders(ordersData.data)
      if (analyticsData.success) setAnalytics(analyticsData.data)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'out_of_stock': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and track your business</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/seller/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{analytics.revenueGrowth}% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                  <p className="text-sm text-blue-600">+{analytics.ordersGrowth}% from last month</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                  <p className="text-sm text-gray-600">{products.filter(p => p.status === 'active').length} active</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-orange-600">Product page visits</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/seller/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.buyer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} items • ₹{order.total}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Selling Products</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/seller/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Products</CardTitle>
              <Button asChild>
                <Link href="/admin/products/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0] || '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{product.price} • Stock: {product.inventory}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{product.rating} ({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleProductDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Management</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/seller/orders">
                  View All Orders
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.buyer.name} • {order.buyer.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • Total: ₹{order.total}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/seller/orders/${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Detailed Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Get comprehensive insights into your sales, customers, and product performance.
            </p>
            <Button asChild>
              <Link href="/seller/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Full Analytics
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}