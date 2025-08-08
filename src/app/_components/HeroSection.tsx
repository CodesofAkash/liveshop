import { Button } from '@/components/ui/button'
import { Eye, TrendingUp } from 'lucide-react'
import React from 'react'

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 mb-12 rounded-lg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Welcome to <span className="text-yellow-300">LiveShop</span>
        </h1>
        <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
          Experience the future of shopping with live streaming, social features, and amazing deals
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            <Eye className="h-5 w-5 mr-2" />
            Watch Live Sessions
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending Products
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
