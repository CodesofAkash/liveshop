'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

interface SearchHistory {
  term: string;
  timestamp: number;
}

interface TrendingSearch {
  term: string;
  count: number;
}

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export default function EnhancedSearch({ 
  placeholder = "Search for products...", 
  className = "",
  onSearch,
  autoFocus = false 
}: EnhancedSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Simple search without complex debouncing
  const performSearch = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load search history and trending searches
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    const mockTrendingSearches: TrendingSearch[] = [
      { term: 'laptop', count: 1250 },
      { term: 'smartphone', count: 980 },
      { term: 'headphones', count: 750 },
      { term: 'gaming chair', count: 650 },
      { term: 'smartwatch', count: 500 }
    ];
    setTrendingSearches(mockTrendingSearches);
  }, []);

  // Handle search input change
  useEffect(() => {
    performSearch(query);
  }, [query]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const saveToHistory = (searchTerm: string) => {
    const newHistory: SearchHistory[] = [
      { term: searchTerm, timestamp: Date.now() },
      ...searchHistory.filter(item => item.term !== searchTerm).slice(0, 9) // Keep only 10 items
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      saveToHistory(searchTerm.trim());
      setQuery(searchTerm);
      setIsOpen(false);
      setSelectedIndex(-1);
      
      if (onSearch) {
        onSearch(searchTerm.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + searchHistory.length + trendingSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          let selectedItem: string;
          if (selectedIndex < suggestions.length) {
            selectedItem = suggestions[selectedIndex].name;
          } else if (selectedIndex < suggestions.length + searchHistory.length) {
            selectedItem = searchHistory[selectedIndex - suggestions.length].term;
          } else {
            selectedItem = trendingSearches[selectedIndex - suggestions.length - searchHistory.length].term;
          }
          handleSearch(selectedItem);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getItemIndex = (sectionIndex: number, itemIndex: number) => {
    switch (sectionIndex) {
      case 0: return itemIndex; // suggestions
      case 1: return suggestions.length + itemIndex; // history
      case 2: return suggestions.length + searchHistory.length + itemIndex; // trending
      default: return -1;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-11"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {/* Product Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                  Products
                </div>
                {suggestions.map((product, index) => (
                  <div
                    key={product.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                      selectedIndex === getItemIndex(0, index) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <>
                {suggestions.length > 0 && <Separator />}
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Searches
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-6 text-xs text-gray-500 hover:text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <div
                      key={`${item.term}-${item.timestamp}`}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                        selectedIndex === getItemIndex(1, index) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleSearch(item.term)}
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-sm">{item.term}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (query.length === 0 || suggestions.length === 0) && (
              <>
                {(suggestions.length > 0 || searchHistory.length > 0) && <Separator />}
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending Searches
                  </div>
                  {trendingSearches.slice(0, 5).map((item, index) => (
                    <div
                      key={item.term}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                        selectedIndex === getItemIndex(2, index) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleSearch(item.term)}
                    >
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-sm">{item.term}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Loading State */}
            {loading && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && !loading && suggestions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No products found for &quot;{query}&quot;
                <br />
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleSearch(query)}
                  className="mt-2"
                >
                  Search anyway
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            {query.length >= 2 && !loading && (
              <>
                <Separator />
                <div className="px-4 py-2 bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(query)}
                    className="w-full justify-start text-blue-600 hover:text-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search for &quot;{query}&quot;
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}