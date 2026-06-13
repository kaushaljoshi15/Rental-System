'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/components/vendor-context'
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Filter, 
  Trash2, 
  Pause, 
  Play, 
  MoreVertical, 
  Edit,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload
} from 'lucide-react'
import { MassImport } from './mass-import'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { bulkUpdateProductStatus, bulkDeleteProducts } from '@/actions/vendor-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  priceDaily: number
  totalStock: number
  isRentable: boolean
  isApproved: boolean
  image: string | null
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Category[]
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const { t, language } = useVendor()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Grid vs List View State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [priceRange, setPriceRange] = useState<number>(10000)
  const [showImportModal, setShowImportModal] = useState(false)

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filtering Logic
  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'ALL' || product.categoryId === selectedCategory
    
    // Status definitions: ACTIVE (approved + rentable + stock > 0), PAUSED (not rentable), OUT_OF_STOCK (rentable + stock = 0)
    let status = 'ACTIVE'
    if (!product.isRentable) status = 'PAUSED'
    else if (product.totalStock <= 0) status = 'OUT_OF_STOCK'
    
    const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus
    
    const matchesPrice = product.priceDaily <= priceRange

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice
  })

  // Selection Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id))
    }
  }

  // Bulk status changes
  const handleBulkStatusChange = (rentable: boolean) => {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      const res = await bulkUpdateProductStatus(selectedIds, rentable)
      if (res.success) {
        toast.success(res.message)
        setSelectedIds([])
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  // Bulk deletes
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} listings? This action cannot be undone.`)) return
    
    startTransition(async () => {
      const res = await bulkDeleteProducts(selectedIds)
      if (res.success) {
        toast.success(res.message)
        setSelectedIds([])
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  // Single Delete
  const handleSingleDelete = (id: string) => {
    if (!confirm("Delete this listing?")) return
    startTransition(async () => {
      const res = await bulkDeleteProducts([id])
      if (res.success) {
        toast.success("Listing removed successfully.")
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('mylistings')}</h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
            {language === 'en' 
              ? `Manage and publish equipment specs (${filteredProducts.length} items listed)`
              : `अपने उपकरणों की सूची प्रबंधित करें (${filteredProducts.length} उत्पाद सूचीबद्ध)`}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button 
            onClick={() => setShowImportModal(true)} 
            variant="outline"
            className="border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-extrabold text-xs h-10 px-4 rounded-xl shadow-sm"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Import CSV
          </Button>
          <Link href="/dashboard/vendor/products/new">
            <Button className="bg-amber-500 text-[#0F172A] hover:bg-amber-600 font-extrabold text-xs tracking-wider rounded-xl shadow-md h-10 px-4">
              <Plus className="w-4 h-4 mr-1.5" /> {t('addproduct')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Control panel (Search, view mode, category filter) */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, tags or SKU..."
              className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs"
            />
          </div>

          {/* Toggle buttons grid */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            {/* Grid/List View switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn("h-9 w-9 rounded-lg", viewMode === 'list' && "bg-amber-500 text-[#0F172A] hover:bg-amber-500 hover:text-[#0F172A]")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn("h-9 w-9 rounded-lg", viewMode === 'grid' && "bg-amber-500 text-[#0F172A] hover:bg-amber-500 hover:text-[#0F172A]")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price slider filter */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Max Daily Rate:</span>
            <input 
              type="range"
              min="100"
              max="10000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full sm:w-44 accent-amber-500 h-1 rounded bg-slate-200 dark:bg-slate-800 cursor-pointer"
            />
            <span className="text-xs font-black text-slate-850 dark:text-slate-200">₹{priceRange.toLocaleString()}/day</span>
          </div>

          {/* Reset button */}
          {(searchTerm !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || priceRange !== 10000) && (
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('ALL')
                setSelectedStatus('ALL')
                setPriceRange(10000)
              }}
              className="text-amber-550 font-bold text-xs p-0 h-auto self-end"
            >
              Reset Filters
            </Button>
          )}
        </div>

      </div>

      {/* Bulk actions bar if selection exists */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 select-none">
          <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
            {selectedIds.length} items selected
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={() => handleBulkStatusChange(true)}
              className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold h-8 rounded-lg"
            >
              <Play className="w-3.5 h-3.5 mr-1" /> Activate
            </Button>
            <Button 
              size="sm"
              onClick={() => handleBulkStatusChange(false)}
              className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold h-8 rounded-lg"
            >
              <Pause className="w-3.5 h-3.5 mr-1" /> Pause
            </Button>
            <Button 
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-[10px] font-extrabold h-8 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Main Inventory Display Grid/List */}
      {filteredProducts.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-550">No products found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Try modifying your query options or add a new piece of rental hardware.
              </p>
            </div>
            <Link href="/dashboard/vendor/products/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs tracking-wider rounded-xl shadow-md h-9">
                <Plus className="w-4 h-4 mr-1.5" /> Add First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        
        // List Layout (Table)
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-900">
                  <tr>
                    <th className="px-5 py-4 w-8">
                      <input 
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                        className="accent-amber-500 h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4">Image</th>
                    <th className="px-5 py-4">Listing Name</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Daily Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id)
                    let statusLabel = 'Active'
                    let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                    
                    if (!product.isRentable) {
                      statusLabel = 'Paused'
                      statusColor = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                    } else if (product.totalStock <= 0) {
                      statusLabel = 'Out of Stock'
                      statusColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                    }

                    return (
                      <tr key={product.id} className={cn("hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors", isSelected && "bg-amber-500/5")}>
                        <td className="px-5 py-4">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                            className="accent-amber-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-10 w-14 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-900 dark:text-slate-50 max-w-xs truncate">{product.name}</div>
                          {!product.isApproved && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-600 uppercase bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-1.5 py-0.5 rounded mt-1">
                              <AlertCircle className="w-3 h-3" /> Awaiting Admin Approval
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-bold">
                          {product.category?.name || 'General'}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-900 dark:text-slate-50">
                          ₹{product.priceDaily.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-400 font-extrabold">
                          {product.totalStock} units
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider", statusColor)}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/vendor/products/${product.id}/edit`} className="cursor-pointer">
                                  <Edit className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Listing
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSingleDelete(product.id)}
                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        
        // Grid Layout
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            let statusLabel = 'Active'
            let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
            
            if (!product.isRentable) {
              statusLabel = 'Paused'
              statusColor = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            } else if (product.totalStock <= 0) {
              statusLabel = 'Out of Stock'
              statusColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
            }

            return (
              <Card key={product.id} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-950 flex flex-col justify-between">
                <div>
                  {/* Media box */}
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-900 relative overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                    <Badge className="absolute top-3 right-3 bg-white/95 dark:bg-slate-950/95 text-slate-950 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-800 uppercase font-black text-[9px] tracking-wider">
                      {product.category?.name || 'General'}
                    </Badge>
                    
                    {/* Status Badge */}
                    <span className={cn("absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider", statusColor)}>
                      {statusLabel}
                    </span>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mt-1">
                      {product.description || 'No description available.'}
                    </p>
                  </CardHeader>
                </div>

                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex justify-between items-baseline border-t border-slate-100 dark:border-slate-900 pt-3">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-slate-900 dark:text-slate-550">₹{product.priceDaily.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 font-bold">/day</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Stock: {product.totalStock}</span>
                  </div>

                  <div className="flex gap-2 w-full pt-1.5">
                    <Link href={`/dashboard/vendor/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full text-[10px] font-extrabold h-8 rounded-lg border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSingleDelete(product.id)}
                      className="text-red-600 hover:bg-red-50 border-slate-200 dark:border-slate-800 text-[10px] font-extrabold h-8 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {showImportModal && (
        <MassImport 
          categories={categories}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
