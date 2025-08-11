'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Filter,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    images: string[]
  }
  selectedVariants?: {
    color?: string
    size?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount?: number
  items: OrderItem[]
  buyer: {
    id: string
    name: string
    email: string
  }
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, paymentFilter, searchTerm])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data) // ✅ data.data is now the orders array
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error('Failed to fetch orders:', data.error)
        // ✅ Set empty array on error instead of keeping old data
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([]) // ✅ Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus as any } : order
          ))
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Package className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const ordersByStatus = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">Track and manage all your orders</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">All Orders</p>
            <p className="text-2xl font-bold">{ordersByStatus.all}</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'pending' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-xl font-bold">{ordersByStatus.pending}</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'confirmed' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            <p className="text-xl font-bold">{ordersByStatus.confirmed}</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'processing' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('processing')}
        >
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="text-sm font-medium text-muted-foreground">Processing</p>
            <p className="text-xl font-bold">{ordersByStatus.processing}</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'shipped' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('shipped')}
        >
          <CardContent className="p-4 text-center">
            <Truck className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
            <p className="text-sm font-medium text-muted-foreground">Shipped</p>
            <p className="text-xl font-bold">{ordersByStatus.shipped}</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'delivered' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('delivered')}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-sm font-medium text-muted-foreground">Delivered</p>
            <p className="text-xl font-bold">{ordersByStatus.delivered}</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'cancelled' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('cancelled')}
        >
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
            <p className="text-xl font-bold">{ordersByStatus.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      <span className="capitalize">{order.paymentStatus}</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Customer:</strong> {order.buyer.name} ({order.buyer.email})</p>
                    <p><strong>Items:</strong> {order.items.length} products • <strong>Total:</strong> ₹{order.total}</p>
                    <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.trackingNumber && (
                      <p><strong>Tracking:</strong> {order.trackingNumber}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <img
                        src={item.product.images[0] || '/placeholder-image.jpg'}
                        alt={item.product.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-sm">{item.product.title}</span>
                      <Badge variant="secondary">×{item.quantity}</Badge>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
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
  )
}