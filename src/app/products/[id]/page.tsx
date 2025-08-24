'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Plus, Minus, ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDbCartStore } from '@/lib/cart-store';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { WishlistTextButton } from '@/components/WishlistButton';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category: string;
  brand?: string;
  inStock: boolean;
  inventory: number;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  specifications?: Record<string, string>;
  sellerId?: string;
  seller?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    rating?: number;
    responseTime?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user: {
    firstName: string;
    lastName?: string;
    imageUrl?: string;
  };
  verified: boolean;
  createdAt: string;
  helpful: number;
}

interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { addItem } = useDbCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  
  // Contact seller state
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Default images fallback
  const defaultImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
  ];

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          setProduct(data.data);
          
          // Check if user has already reviewed this product
          if (user && data.data.reviews) {
            const userReview = data.data.reviews.find((review: Review) => review.userId === user.id);
            setHasUserReviewed(!!userReview);
          }
        } else {
          setError('Product data not available');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 404) {
          setError('Product not found');
        } else if (response.status === 401) {
          setError('Please sign in to view this product');
        } else {
          setError(errorData?.error || `Failed to load product (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/products/${product.id}/reviews`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  const fetchRelatedProducts = useCallback(async () => {
    if (!product?.category) return;
    
    try {
      const response = await fetch(`/api/products?category=${product.category}&limit=4&exclude=${product.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRelatedProducts(data.data?.products || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    }
  }, [product?.category, product?.id]);

  useEffect(() => {
    fetchProduct();
  }, [params.id, fetchProduct]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRelatedProducts();
    }
  }, [product, fetchReviews, fetchRelatedProducts]);

  const handleAddToCart = async () => {
    if (!product || !user) return;
    
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} ${product.title} to cart!`);
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || submittingReview) return;
    
    try {
      setSubmittingReview(true);
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Review submitted successfully!');
        setReviewComment('');
        setReviewRating(5);
        setHasUserReviewed(true);
        fetchReviews();
        fetchProduct(); // Refresh to update rating
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleContactSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !contactMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: product.sellerId || product.seller?.id,
          productId: product.id,
          message: contactMessage.trim(),
          subject: `Inquiry about ${product.title}`,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Message sent to seller!');
        setContactMessage('');
        setShowContactForm(false);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 ? product.images : 
                       product.imageUrl ? [product.imageUrl] : defaultImages;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-gray-800">
            Home
          </button>
          {product.category && (
            <>
              <span>/</span>
              <button 
                onClick={() => router.push(`/categories/${encodeURIComponent(product.category)}`)} 
                className="hover:text-gray-800"
              >
                {product.category}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={productImages[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating?.toFixed(1) || 'No rating'} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <Badge variant="outline">{product.category}</Badge>
                {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
              </div>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-green-600">{formatCurrency(product.price)}</span>
                <span className="text-sm text-gray-500">Free shipping on orders over ₹2000</span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Seller Info */}
            {product.seller && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.seller.avatar && (
                        <Image
                          src={product.seller.avatar}
                          alt={product.seller.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.seller.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {product.seller.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{product.seller.rating}</span>
                            </div>
                          )}
                          {product.seller.responseTime && (
                            <span>• Responds in {product.seller.responseTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowContactForm(!showContactForm)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                  
                  {/* Contact Form */}
                  {showContactForm && user && (
                    <form onSubmit={handleContactSeller} className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Ask a question about this product..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        rows={3}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={sendingMessage || !contactMessage.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          {sendingMessage ? 'Sending...' : 'Send Message'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {setShowContactForm(false); setContactMessage('');}}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                  
                  {showContactForm && !user && (
                    <div className="mt-4 text-center">
                      <SignInButton mode="modal">
                        <Button size="sm">Sign in to contact seller</Button>
                      </SignInButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.inventory || 999)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.max(0, (product.inventory || 0) - quantity + 1)} left in stock
                </span>
              </div>

              <div className="flex gap-4">
                {user ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 h-12"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button disabled={!product.inStock} className="flex-1 h-12">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </SignInButton>
                )}
                
                {user ? (
                  <WishlistTextButton productId={product.id} className="h-12 px-6" />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="outline" className="h-12 px-6">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </SignInButton>
                )}
                
                <Button variant="outline" className="h-12 px-6">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">1 Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-purple-500" />
                    <span className="text-sm">30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Premium Quality</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <p>Detailed specifications coming soon!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Reviews Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-500 mb-2">
                          {product.rating?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{product.reviewCount || 0} Reviews</p>
                      </div>
                      
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-sm w-3">{stars}</span>
                              <Star className="h-4 w-4 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{Math.round(percentage)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Write Review Form */}
                {user && !hasUserReviewed && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <Label htmlFor="rating">Rating</Label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`h-6 w-6 ${
                                  star <= reviewRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              >
                                <Star className="h-full w-full" />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="comment">Your Review</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with this product..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <Button type="submit" disabled={submittingReview || !reviewComment.trim()}>
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Sign in prompt for reviews */}
                {!user && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-600 mb-4">Sign in to write a review</p>
                      <SignInButton mode="modal">
                        <Button>Sign In</Button>
                      </SignInButton>
                    </CardContent>
                  </Card>
                )}

                {/* Individual Reviews */}
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6 animate-pulse">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              {review.user.imageUrl && (
                                <Image
                                  src={review.user.imageUrl}
                                  alt={review.user.firstName}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">
                                    {review.user.firstName} {review.user.lastName || ''}
                                  </span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {review.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                          {review.helpful > 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                              {review.helpful} people found this helpful
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card 
                  key={relatedProduct.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/products/${relatedProduct.id}`)}
                >
                  <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                    <Image
                      src={relatedProduct.imageUrl || defaultImages[0]}
                      alt={relatedProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">
                        {formatCurrency(relatedProduct.price)}
                      </span>
                      {relatedProduct.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {relatedProduct.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}