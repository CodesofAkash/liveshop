// src/components/WishlistButton.tsx
'use client';

import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { useWishlistButton } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
}

export default function WishlistButton({
  productId,
  variant = 'outline',
  size = 'default',
  className,
  showText = false,
  iconOnly = false,
}: WishlistButtonProps) {
  const { isWishlisted, isLoading, isAuthenticated, toggle } = useWishlistButton(productId);

  // If user is not authenticated, show sign-in button
  if (!isAuthenticated) {
    return (
      <SignInButton mode="modal">
        <Button 
          variant={variant} 
          size={size} 
          className={cn("group", className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          {showText && !iconOnly && (
            <span className="ml-2">Save</span>
          )}
        </Button>
      </SignInButton>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        "group relative transition-all duration-200",
        isWishlisted && variant === 'outline' 
          ? "border-red-500 text-red-500 hover:bg-red-50" 
          : "",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200 group-hover:scale-110",
            isWishlisted 
              ? "fill-red-500 text-red-500" 
              : "group-hover:text-red-400"
          )}
        />
      )}
      
      {showText && !iconOnly && (
        <span className="ml-2">
          {isWishlisted ? 'Saved' : 'Save'}
        </span>
      )}

      {/* Animated heart effect when adding */}
      {isWishlisted && (
        <div className="absolute inset-0 pointer-events-none">
          <Heart 
            className="h-4 w-4 text-red-500 fill-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75" 
          />
        </div>
      )}
    </Button>
  );
}

// Compact version for product cards
export function WishlistIconButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  return (
    <WishlistButton
      productId={productId}
      variant="ghost"
      size="sm"
      iconOnly
      className={cn(
        "h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md",
        className
      )}
    />
  );
}

// Text version for product detail pages
export function WishlistTextButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  return (
    <WishlistButton
      productId={productId}
      variant="outline"
      size="default"
      showText
      className={cn("min-w-[120px]", className)}
    />
  );
}