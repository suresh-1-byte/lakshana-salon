'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Link2 } from 'lucide-react'
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
import AddonForm from '@/components/admin/AddonForm'
import { getAllAddons, deleteAddon } from '@/lib/api/service-addons'
import { toast } from '@/hooks/use-toast'
import type { ServiceAddon } from '@/types/database.types'

export default function ServiceAddonsPage() {
  const [addons, setAddons] = useState<ServiceAddon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddon, setEditingAddon] = useState<ServiceAddon | null>(null)

  useEffect(() => {
    loadAddons()
  }, [])

  const loadAddons = async () => {
    try {
      setLoading(true)
      const data = await getAllAddons(false) // Get all including inactive
      setAddons(data)
    } catch (error) {
      console.error('Error loading addons:', error)
      toast({
        title: 'Error',
        description: 'Failed to load add-ons',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (addon: ServiceAddon) => {
    setEditingAddon(addon)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return

    try {
      await deleteAddon(id)
      toast({
        title: 'Success',
        description: 'Add-on deleted successfully',
      })
      loadAddons()
    } catch (error) {
      console.error('Error deleting addon:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete add-on',
        variant: 'destructive',
      })
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAddon(null)
    loadAddons()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Service Add-ons</h1>
          <p className="text-gray-400 mt-1">Manage reusable add-ons for services</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setEditingAddon(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Add-on
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddon ? 'Edit Add-on' : 'Create New Add-on'}
              </DialogTitle>
            </DialogHeader>
            <AddonForm
              addon={editingAddon}
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
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
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
            ) : addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No add-ons found. Create your first add-on!
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id} className="border-gray-800">
                  <TableCell>
                    <span className="text-2xl">{addon.icon || '➕'}</span>
                  </TableCell>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell className="text-gray-400 max-w-md truncate">
                    {addon.description || '-'}
                  </TableCell>
                  <TableCell className="text-amber-400 font-semibold">
                    +₹{addon.price}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {addon.duration > 0 ? `+${addon.duration} min` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        addon.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }
                    >
                      {addon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(addon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(addon.id)}
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
          <p className="text-sm text-gray-400">Total Add-ons</p>
          <p className="text-2xl font-bold text-amber-400">{addons.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Active Add-ons</p>
          <p className="text-2xl font-bold text-green-500">
            {addons.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Revenue Potential</p>
          <p className="text-2xl font-bold text-blue-500">
            ₹{addons.reduce((sum, a) => sum + a.price, 0)}
          </p>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-amber-400 mb-2">💡 How Add-ons Work</h3>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Create reusable add-ons (Hair Serum, Deep Conditioning, etc.)</li>
          <li>Assign add-ons to multiple services</li>
          <li>Customers can select add-ons during booking</li>
          <li>Price and duration automatically added to total</li>
        </ul>
      </div>
    </div>
  )
}
