"use client";
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  const handleOpenSignIn = () => {
    if (typeof window !== 'undefined' && window.Clerk) {
      window.Clerk.openSignIn();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view this page</h1>
          <p className="text-gray-600 mb-6">This page requires authentication.</p>
          <Button onClick={handleOpenSignIn}>Sign In</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
