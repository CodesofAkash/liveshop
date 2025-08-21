// src/components/CartSync.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useDbCartStore } from '@/lib/cart-store';

export function CartSync() {
  const { isLoaded, user } = useUser();
  const { fetchCart, clearState } = useDbCartStore();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // User is logged in, fetch their cart from database
        fetchCart();
      } else {
        // User is logged out, clear cart state
        clearState();
      }
    }
  }, [isLoaded, user, fetchCart, clearState]);

  return null; // This component doesn't render anything
}
