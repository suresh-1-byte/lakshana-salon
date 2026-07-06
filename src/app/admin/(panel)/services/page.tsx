'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Filter } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ServiceForm from '@/components/admin/ServiceForm'
import { getAllServices, deleteService } from '@/lib/api/services'
import { getAllCategories } from '@/lib/api/service-categories'
import { toast } from '@/hooks/use-toast'
import type { Service, ServiceCategory } from '@/types/database.types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(services)
    } else {
      setFilteredServices(services.filter(s => s.category_id === selectedCategory))
    }
  }, [selectedCategory, services])

  const loadData = async () => {
    try {
      setLoading(true)
      const [servicesData, categoriesData] = await Promise.all([
        getAllServices(),
        getAllCategories(false)
      ])
      setServices(servicesData)
      setCategories(categoriesData)
      setFilteredServices(servicesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await deleteService(id)
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      })
      loadData()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      })
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingService(null)
    loadData()
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized'
    const category = categories.find(c => c.id === categoryId)
    return category ? `${category.icon || ''} ${category.name}` : 'Unknown'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Services</h1>
          <p className="text-gray-400 mt-1">Manage salon services</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Create New Service'}
              </DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              categories={categories}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Offer Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No services found. Create your first service!
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id} className="border-gray-800">
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{getCategoryName(service.category_id)}</TableCell>
                  <TableCell>₹{service.price}</TableCell>
                  <TableCell>
                    {service.offer_price ? (
                      <span className="text-green-500">₹{service.offer_price}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        service.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }
                    >
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(service.id)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Services</p>
          <p className="text-2xl font-bold text-amber-400">{services.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Active Services</p>
          <p className="text-2xl font-bold text-green-500">
            {services.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-blue-500">{categories.length}</p>
        </div>
      </div>
    </div>
  )
}
