import React from 'react'

const StatsSection = () => {
  return (
    <section className="mt-16 bg-white rounded-lg p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
            <div className="text-gray-600">Products</div>
        </div>
        <div>
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Sellers</div>
        </div>
        <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
            <div className="text-gray-600">Happy Customers</div>
        </div>
        <div>
            <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
            <div className="text-gray-600">Live Shopping</div>
        </div>
        </div>
    </section>
  )
}

export default StatsSection
