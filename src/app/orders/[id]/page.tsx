'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Edit,
  Save,
  Download,
  MessageSquare,
  AlertTriangle
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
    brand?: string
  }
  selectedVariants?: {
    color?: string
    size?: string
    [key: string]: any
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: string
  paymentId?: string
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
    phone?: string
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
  billingAddress?: {
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
  giftMessage?: string
  createdAt: string
  updatedAt: string
}

export default function OrderDetails() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editingTracking, setEditingTracking] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`) // ✅ Use buyer orders API, not seller
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
        setTrackingNumber(data.data.trackingNumber || '')
        setNewStatus(data.data.status)
        setAdminNotes(data.data.adminNotes || '')
      } else {
        console.error('Failed to fetch order:', data.error)
        setOrder(null)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, { // ✅ Use buyer orders API
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
          adminNotes: adminNotes || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrder(data.data)
          setEditingStatus(false)
          setEditingTracking(false)
        }
      }
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(false)
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

  const downloadInvoice = () => {
    // Implementation for downloading invoice
    console.log('Downloading invoice for order:', orderId)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/seller/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                <span className="capitalize">{order.paymentStatus}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Order placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={downloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product.images[0] || '/placeholder-image.jpg'}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.title}</h3>
                      {item.product.brand && (
                        <p className="text-sm text-muted-foreground">Brand: {item.product.brand}</p>
                      )}
                      {item.selectedVariants && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Update - Fix the duplicate className issue */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Order Status</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingStatus(!editingStatus)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {editingStatus ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                {editingStatus ? (
                  <div className="space-y-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={updateOrderStatus} 
                      disabled={updating}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updating ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Tracking Number */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Tracking Number</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTracking(!editingTracking)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {editingTracking ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                {editingTracking ? (
                  <div className="space-y-3">
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                    <Button 
                      onClick={updateOrderStatus} 
                      disabled={updating}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updating ? 'Saving...' : 'Save Tracking Number'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {order.trackingNumber ? (
                      <p className="font-mono">{order.trackingNumber}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No tracking number added</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Admin Notes */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Internal Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this order..."
                  rows={3}
                  className="mb-3"
                />
                <Button 
                  onClick={updateOrderStatus} 
                  disabled={updating}
                  variant="outline"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">{order.buyer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.buyer.email}</span>
                </div>
                {order.buyer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{order.buyer.phone}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Customer
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <div className="flex items-center gap-2 text-muted-foreground pt-2">
                  <Phone className="h-4 w-4" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
              )}
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>₹{order.shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>₹{order.tax}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₹{order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(order.notes || order.giftMessage) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.notes && (
                  <div>
                    <Label className="text-sm font-medium">Customer Notes:</Label>
                    <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                  </div>
                )}
                {order.giftMessage && (
                  <div>
                    <Label className="text-sm font-medium">Gift Message:</Label>
                    <p className="text-sm text-muted-foreground mt-1">{order.giftMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}