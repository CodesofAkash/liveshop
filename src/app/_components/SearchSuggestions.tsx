'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent' | 'trending';
  count?: number;
}

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_SEARCHES = [
  'iPhone 15',
  'Samsung Galaxy',
  'Nike Shoes',
  'Laptop',
  'Wireless Headphones',
  'Gaming Mouse',
];

export default function SearchSuggestions({
  value,
  onChange,
  onSearch,
  placeholder = "Search for products...",
  className = "",
}: SearchSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(value, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [
      query.trim(),
      ...recentSearches.filter(s => s !== query.trim())
    ].slice(0, 10); // Keep only 10 recent searches

    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle debounced search
  useEffect(() => {
    if (debouncedQuery && isOpen) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, isOpen]);

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (!value.trim()) {
      // Show recent searches and popular searches when no query
      const recentSuggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
      }));

      const popularSuggestions: SearchSuggestion[] = POPULAR_SEARCHES.map((search, index) => ({
        id: `popular-${index}`,
        text: search,
        type: 'trending',
      }));

      setSuggestions([...recentSuggestions, ...popularSuggestions]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    saveRecentSearch(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSearch(value.trim());
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const type = suggestion.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(suggestion);
    return groups;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          className="pl-10 pr-12 py-3 text-lg"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {/* Recent Searches */}
                {groupedSuggestions.recent && (
                  <div className="p-2 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recent Searches
                      </h4>
                      {recentSearches.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    {groupedSuggestions.recent.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-sm">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending/Popular Searches */}
                {groupedSuggestions.trending && (
                  <div className="p-2 border-b">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trending Searches
                    </h4>
                    {groupedSuggestions.trending.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-sm">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Suggestions */}
                {groupedSuggestions.product && (
                  <div className="p-2 border-b">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Products
                    </h4>
                    {groupedSuggestions.product.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center justify-between gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                        </div>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Category Suggestions */}
                {groupedSuggestions.category && (
                  <div className="p-2 border-b">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories
                    </h4>
                    {groupedSuggestions.category.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center justify-between gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                        </div>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count} products
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Brand Suggestions */}
                {groupedSuggestions.brand && (
                  <div className="p-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brands
                    </h4>
                    {groupedSuggestions.brand.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center justify-between gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                        </div>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count} products
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : value.trim() ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No suggestions found for "{value}"</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick({ id: 'search', text: value, type: 'product' })}
                  className="mt-2"
                >
                  Search anyway
                </Button>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Start typing to see suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}