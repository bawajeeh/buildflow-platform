import React from 'react'
import ProductsManagement from '@/components/dashboard/ProductsManagement'

const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your product catalog and inventory
        </p>
      </div>

      <ProductsManagement />
    </div>
  )
}

export default ProductsPage
