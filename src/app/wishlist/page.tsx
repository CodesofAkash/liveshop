'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDbCartStore } from '@/lib/cart-store';

export default function WishlistPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const addItem = useDbCartStore((state) => state.addItem);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn) {
      fetchWishlist();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemoving(productId);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setWishlist(wishlist.filter((item) => item.productId !== productId));
        toast.success('Removed from wishlist');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-red-500 fill-current" />
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add items you love to your wishlist
            </p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item.product.images?.[0] || '/placeholder.png'}
                      alt={item.product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.product.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold">₹{item.product.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= item.product.rating ? 'text-yellow-400' : 'text-gray-300'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span>({item.product.reviewCount})</span>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.productId)}
                    className="flex-1"
                    disabled={item.product.inventory === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {item.product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    onClick={() => removeFromWishlist(item.productId)}
                    variant="outline"
                    size="icon"
                    disabled={removing === item.productId}
                  >
                    {removing === item.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}