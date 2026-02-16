'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDbCartStore } from '@/lib/cart-store';

export default function DealsPage() {
  const { isSignedIn } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useDbCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/products/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load deals');
      });
  }, []);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      await addItem(productId, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Added to wishlist!');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Special Deals</h1>
          <p className="text-muted-foreground">Amazing discounts and offers</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No deals available right now</p>
          <Link href="/">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="group hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4">
                  <Badge className="absolute top-2 left-2 z-10 bg-green-600">
                    Deal
                  </Badge>
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => handleAddToWishlist(product.id, e)}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    {product.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= product.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span>({product.reviewCount})</span>
                  </div>
                  <Button
                    onClick={(e) => handleAddToCart(product.id, e)}
                    className="w-full"
                    disabled={!isSignedIn || product.inventory === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}