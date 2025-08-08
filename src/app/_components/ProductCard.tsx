import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useProductsStore } from '@/lib/store'
import { mockProducts } from '../constants'
import { Skeleton } from '@/components/ui/skeleton'

const ProductCard = ({ product }: { product: typeof mockProducts[0] }) => {
  const addItem = useProductsStore((state) => state.addProduct)
  const addToCart = () => {
    // This will be connected to cart store
    console.log('Add to cart:', product.name)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90">
              ₹{product.price.toLocaleString()}
            </Badge>
          </div>
          {product.inventory < 20 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">Low Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
          {product.name}
        </CardTitle>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <Badge variant="outline">{product.category}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{product.inventory} in stock</span>
          <span>{product.sellerId}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={addToCart}
          className="w-full group-hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard;

export const ProductSkeleton = () => {
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