'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton, SignUpButton, SignOutButton, UserButton } from '@clerk/nextjs'
import { useCartStore, useUserStore, useUIStore, useLiveStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  Heart,
  Package,
  Settings,
  LogOut,
  Bell,
  Play,
  TrendingUp,
  Zap,
  Moon,
  Sun,
  Store,
  BarChart3,
  Users
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import EnhancedSearch from './EnhancedSearch'

// Cart Sidebar Component
const CartSidebar = () => {
  const { items, total, itemCount, isOpen, setCartOpen, removeItem, updateQuantity, clearCart } = useCartStore()

  const handleCheckout = () => {
    // This will redirect to checkout page
    setCartOpen(false)
  }

  const router = useRouter();

  // Calculate total safely
  const cartTotal = total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart ({itemCount})
            {itemCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear All
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? "Your cart is empty" : `${itemCount} items in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {itemCount === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <Button onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700 ml-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <Button onClick={() => {router.push('/cart');setCartOpen(false);}} className="w-full" size="lg">
                  Go to Cart Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCartOpen(false)}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Navigation Links Component
const NavigationLinks = ({ mobile = false }: { mobile?: boolean }) => {
  const className = mobile ? "flex flex-col space-y-4" : ""
  
  return (
    <div className={className}>
      <NavigationMenu>
        <NavigationMenuList className={mobile ? "flex-col space-x-0 space-y-2" : ""}>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[400px] p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/categories/electronics" className="block p-3 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Electronics</div>
                    <div className="text-sm text-gray-500">Phones, Laptops, Gadgets</div>
                  </Link>
                  <Link href="/categories/fashion" className="block p-3 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Fashion</div>
                    <div className="text-sm text-gray-500">Clothing, Shoes, Accessories</div>
                  </Link>
                  <Link href="/categories/home" className="block p-3 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Home & Garden</div>
                    <div className="text-sm text-gray-500">Furniture, Decor, Tools</div>
                  </Link>
                  <Link href="/categories/sports" className="block p-3 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">Sports</div>
                    <div className="text-sm text-gray-500">Fitness, Outdoor, Games</div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/live" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100">
              <Play className="h-4 w-4 text-red-500" />
              <span>Live</span>
              <Badge className="bg-red-500 text-xs px-1">HOT</Badge>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/trending" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100">
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/deals" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Deals</span>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

// User Menu Component
const UserMenu = () => {
  const { user, isSignedIn } = useUser()
  const { theme, setTheme } = useUIStore()
  const router = useRouter()

  if (!isSignedIn) {
    return (
      <div className="flex items-center space-x-2">
        <SignInButton mode="modal">
          <Button variant="ghost">Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Get Started</Button>
        </SignUpButton>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="flex flex-col space-y-1">
              <div className="font-medium">New live session started</div>
              <div className="text-sm text-gray-500">Tech gadgets showcase is now live</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col space-y-1">
              <div className="font-medium">Order shipped</div>
              <div className="text-sm text-gray-500">Your wireless headphones are on the way</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2">
            <UserButton afterSignOutUrl="/" />
            <span className="hidden md:block">{user?.firstName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span>{user?.fullName}</span>
            <span className="text-sm font-normal text-gray-500">{user?.emailAddresses[0]?.emailAddress}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push('/orders')}>
            <Package className="h-4 w-4 mr-2" />
            My Orders
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push('/wishlist')}>
            <Heart className="h-4 w-4 mr-2" />
            Wishlist
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <Store className="h-4 w-4 mr-2" />
            Dashboard
          </DropdownMenuItem>

          {/* Seller Options */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>
            <Store className="h-4 w-4 mr-2" />
            Seller Dashboard
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push('/seller/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <SignOutButton>
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </div>
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Mobile Menu Component
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <NavigationLinks mobile />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Search Bar Component
const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search products, brands, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 w-full"
        />
      </div>
    </form>
  )
}

// Main Header Component
export default function Header() {
  const { itemCount, toggleCart } = useCartStore()
  const { activeSessions } = useLiveStore()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}>
        {/* Top Bar with Live Sessions */}
        {activeSessions.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2">
            <div className="container mx-auto flex items-center justify-center text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-medium">
                  {activeSessions.length} Live Session{activeSessions.length > 1 ? 's' : ''} Now
                </span>
                <Users className="h-4 w-4 ml-2" />
                <span>{activeSessions.reduce((total, session) => total + session.viewerCount, 0)} watching</span>
              </div>
              <Button variant="ghost" size="sm" className="ml-4 text-white hover:text-white hover:bg-white/20">
                Join Now
              </Button>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <MobileMenu />
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LS</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LiveShop
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <EnhancedSearch placeholder="Search products, brands, categories..." className="max-w-md" />
              {/* <SearchBar /> */}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Button
                variant="ghost"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="hidden md:block border-t bg-white/95">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-3">
              <NavigationLinks />
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  )
}