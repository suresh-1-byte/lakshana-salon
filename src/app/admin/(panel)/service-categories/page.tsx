'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, MoveVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import CategoryForm from '@/components/admin/CategoryForm'
import { getAllCategories, deleteCategory } from '@/lib/api/service-categories'
import { toast } from '@/hooks/use-toast'
import type { ServiceCategory } from '@/types/database.types'

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getAllCategories(false) // Get all including inactive
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteCategory(id)
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCategory(null)
    loadCategories()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Service Categories</h1>
          <p className="text-gray-400 mt-1">Manage service categories for your salon</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setEditingCategory(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Order</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  No categories found. Create your first category!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="border-gray-800">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MoveVertical className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{category.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-2xl">{category.icon || '📋'}</span>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-400">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        category.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-amber-400 mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-gray-300">
          Categories help organize your services. Create categories first, then add services to each category.
          Customers will select a category before choosing specific services.
        </p>
      </div>
    </div>
  )
}
