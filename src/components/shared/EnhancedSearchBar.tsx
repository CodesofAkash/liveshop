'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EnhancedSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (showDropdown && !recommendations) {
      fetchRecommendations();
    }
  }, [showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/search/recommendations');
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearch = (search: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="pl-10 pr-4"
          />
        </div>
      </form>

      {showDropdown && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[400px] overflow-y-auto">
          <CardContent className="p-4">
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm">{search}</span>
                      <button
                        onClick={(e) => clearRecentSearch(search, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recommendations?.trending?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Trending Now</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.trending.slice(0, 3).map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recommendations?.categories?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-3">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.categories.map((cat: any, index: number) => (
                    <Link
                      key={index}
                      href={`/search?category=${cat.category}`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {cat.category}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}