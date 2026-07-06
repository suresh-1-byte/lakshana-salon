'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createService, updateService } from '@/lib/api/services'
import { getAllAddons } from '@/lib/api/service-addons'
import { bulkAssignAddonsToService, getAddonsForService } from '@/lib/api/service-addons'
import { toast } from '@/hooks/use-toast'
import type { Service, ServiceCategory, ServiceAddon } from '@/types/database.types'

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  offer_price: z.string().optional(),
  duration: z.string().min(1, 'Duration is required'),
  display_order: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  service?: Service | null
  categories: ServiceCategory[]
  onSuccess: () => void
  onCancel: () => void
}

export default function ServiceForm({ service, categories, onSuccess, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [addons, setAddons] = useState<ServiceAddon[]>([])
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      category_id: service?.category_id || '',
      description: service?.description || '',
      price: String(service?.price || ''),
      offer_price: service?.offer_price ? String(service.offer_price) : '',
      duration: String(service?.duration || '60'),
      display_order: String(service?.display_order || '0'),
      status: service?.status || 'active',
    },
  })

  useEffect(() => {
    loadAddons()
    if (service) {
      loadServiceAddons()
    }
  }, [service])

  const loadAddons = async () => {
    try {
      const data = await getAllAddons()
      setAddons(data)
    } catch (error) {
      console.error('Error loading addons:', error)
    }
  }

  const loadServiceAddons = async () => {
    if (!service) return
    try {
      const data = await getAddonsForService(service.id)
      setSelectedAddonIds(data.map((a: any) => a.id))
    } catch (error) {
      console.error('Error loading service addons:', error)
    }
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId)
      } else {
        return [...prev, addonId]
      }
    })
  }

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      setLoading(true)

      // Get category name for backward compatibility
      const category = categories.find(c => c.id === data.category_id)

      const serviceData = {
        ...data,
        category: category?.name || 'General',
        price: Number(data.price),
        offer_price: data.offer_price ? Number(data.offer_price) : null,
        duration: Number(data.duration),
        display_order: Number(data.display_order || 0),
      }

      let serviceId: string

      if (service) {
        await updateService(service.id, serviceData)
        serviceId = service.id
        toast({
          title: 'Success',
          description: 'Service updated successfully',
        })
      } else {
        const newService = await createService(serviceData)
        serviceId = newService.id
        toast({
          title: 'Success',
          description: 'Service created successfully',
        })
      }

      // Assign add-ons to service
      if (selectedAddonIds.length > 0) {
        await bulkAssignAddonsToService(serviceId, selectedAddonIds)
      }

      onSuccess()
    } catch (error: any) {
      console.error('Service error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category this service belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hair Cut, Bridal Makeup" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the service"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offer_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="400"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional discounted price
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="60"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers appear first
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <div className="space-y-3 border border-gray-700 rounded-lg p-4 bg-gray-800/50">
            <div>
              <FormLabel>Available Add-ons</FormLabel>
              <FormDescription>
                Select add-ons customers can choose with this service
              </FormDescription>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50"
                >
                  <Checkbox
                    id={`addon-${addon.id}`}
                    checked={selectedAddonIds.includes(addon.id)}
                    onCheckedChange={() => handleAddonToggle(addon.id)}
                  />
                  <label
                    htmlFor={`addon-${addon.id}`}
                    className="flex-1 flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span className="text-lg">{addon.icon}</span>
                    <span>{addon.name}</span>
                    <span className="text-amber-400 ml-auto">+₹{addon.price}</span>
                    {addon.duration > 0 && (
                      <span className="text-gray-500 text-xs">+{addon.duration}min</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            {selectedAddonIds.length > 0 && (
              <p className="text-xs text-amber-400">
                {selectedAddonIds.length} add-on(s) selected
              </p>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600">
            {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
