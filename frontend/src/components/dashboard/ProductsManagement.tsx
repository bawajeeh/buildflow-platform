import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Upload,
  Download,
  MoreVertical,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Modal } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'

// Types
import { Product, Order, Customer, Website } from '@/types'

interface ProductsManagementProps {
  website: Website | null
}

const ProductsManagement: React.FC<ProductsManagementProps> = ({ website }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (website) {
      fetchProducts()
      fetchOrders()
      fetchCustomers()
    }
  }, [website])

  const fetchProducts = async () => {
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`/api/websites/${website?.id}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to empty array on error
      setProducts([])
    }
  }

  const fetchOrders = async () => {
    // Mock data
    setOrders([
      {
        id: '1',
        websiteId: website?.id || '',
        customerId: '1',
        orderNumber: 'ORD-001',
        status: 'CONFIRMED',
        items: [],
        subtotal: 119.98,
        tax: 9.60,
        shipping: 10.00,
        discount: 0,
        total: 139.58,
        currency: 'USD',
        shippingAddress: {},
        billingAddress: {},
        paymentStatus: 'PAID',
        paymentMethod: 'credit_card',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  const fetchCustomers = async () => {
    // Mock data
    setCustomers([
      {
        id: '1',
        websiteId: website?.id || '',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        tags: ['vip'],
        totalSpent: 139.58,
        totalOrders: 1,
        lastOrderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && product.isPublished) ||
                         (filterStatus === 'draft' && !product.isPublished)
    return matchesSearch && matchesFilter
  })

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: orders.reduce((sum, order) => sum + order.total, 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Customers',
      value: customers.length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Products</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.title === 'Total Revenue' ? `$${stat.value.toFixed(2)}` : stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    stat.bgColor
                  )}>
                    <Icon className={cn('w-6 h-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Products</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku} • ${product.price}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {product.trackQuantity && (
                        <span className="text-xs text-muted-foreground">
                          {product.quantity} in stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsEditModalOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    }
                  >
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Product"
      >
        <ProductForm
          onSave={async (product) => {
            try {
              const { token } = useAuthStore.getState()
              const response = await fetch(`/api/websites/${website?.id}/products`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(product),
              })

              if (!response.ok) {
                throw new Error('Failed to create product')
              }

              const data = await response.json()
              setProducts(prev => [...prev, data.data])
              setIsCreateModalOpen(false)
            } catch (error) {
              console.error('Error creating product:', error)
              // TODO: Show error toast
            }
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSave={(product) => {
              console.log('Update product:', product)
              setIsEditModalOpen(false)
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  )
}

// Product Form Component
interface ProductFormProps {
  product?: Product
  onSave: (product: Partial<Product>) => void
  onCancel: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    comparePrice: product?.comparePrice || 0,
    trackQuantity: product?.trackQuantity || true,
    quantity: product?.quantity || 0,
    allowBackorder: product?.allowBackorder || false,
    isPublished: product?.isPublished || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Input
        label="SKU"
        value={formData.sku}
        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          required
        />
        <Input
          label="Compare Price"
          type="number"
          step="0.01"
          value={formData.comparePrice}
          onChange={(e) => setFormData({ ...formData, comparePrice: parseFloat(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.trackQuantity}
            onChange={(e) => setFormData({ ...formData, trackQuantity: e.target.checked })}
          />
          Track Quantity
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          />
          Published
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  )
}

export default ProductsManagement
