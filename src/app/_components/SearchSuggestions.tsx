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

// fixed rendering order for groups
const GROUP_ORDER: SearchSuggestion['type'][] = [
  'product',
  'brand',
  'category',
  'recent',
  'trending',
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const debouncedQuery = useDebounce(value, 300);

  // Load recent searches
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

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

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

  useEffect(() => {
    if (debouncedQuery && isOpen) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, isOpen]);

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (!value.trim()) {
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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    saveRecentSearch(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSearch(value.trim());
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Group suggestions
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    if (!groups[suggestion.type]) groups[suggestion.type] = [];
    groups[suggestion.type].push(suggestion);
    return groups;
  }, {} as Record<string, SearchSuggestion[]>);

  // Flattened list for keyboard nav
  const flatSuggestions: SearchSuggestion[] = GROUP_ORDER
    .flatMap(type => groupedSuggestions[type] || []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % flatSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + flatSuggestions.length) % flatSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
        handleSuggestionClick(flatSuggestions[highlightedIndex]);
      } else if (value.trim()) {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      suggestionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12 py-3 text-lg"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : flatSuggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {GROUP_ORDER.map((type) => {
                  const items = groupedSuggestions[type];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={type} className="border-b last:border-0">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        {type}
                      </div>
                      {items.map((suggestion) => {
                        const flatIndex = flatSuggestions.findIndex(s => s.id === suggestion.id);
                        return (
                          <button
                            key={suggestion.id}
                            ref={el => { suggestionRefs.current[flatIndex] = el; }}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full flex items-center justify-between gap-3 p-2 text-left rounded-md transition-colors ${
                              flatIndex === highlightedIndex
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
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
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : value.trim() ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No suggestions found for "{value}"</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleSuggestionClick({ id: 'search', text: value, type: 'product' })
                  }
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
