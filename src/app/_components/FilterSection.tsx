import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProductsStore } from '@/lib/store'
import { Search } from 'lucide-react'
import React from 'react'

const FilterSection = () => {
  const { 
    searchQuery, 
    selectedCategory, 
    priceRange,
    setSearchQuery, 
    setSelectedCategory, 
    setPriceRange 
  } = useProductsStore()

  const categories = ['All', 'Electronics', 'Fashion', 'Sports', 'Books', 'Home']

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm text-gray-600">Price:</span>
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-20"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-20"
          />
        </div>
      </div>
    </div>
  )
}

export default FilterSection
