'use client'

import { useState } from 'react'
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
import { createAddon, updateAddon } from '@/lib/api/service-addons'
import { toast } from '@/hooks/use-toast'
import type { ServiceAddon } from '@/types/database.types'

const addonSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  duration: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type AddonFormValues = z.infer<typeof addonSchema>

interface AddonFormProps {
  addon?: ServiceAddon | null
  onSuccess: () => void
  onCancel: () => void
}

const ADDON_ICONS = [
  { emoji: '💧', label: 'Serum' },
  { emoji: '🧴', label: 'Product' },
  { emoji: '💆', label: 'Massage' },
  { emoji: '✨', label: 'Enhancement' },
  { emoji: '🌟', label: 'Special' },
  { emoji: '💎', label: 'Premium' },
  { emoji: '💪', label: 'Treatment' },
  { emoji: '🎭', label: 'Mask' },
  { emoji: '✏️', label: 'Detail' },
  { emoji: '💅', label: 'Nails' },
  { emoji: '💄', label: 'Makeup' },
  { emoji: '😌', label: 'Relax' },
]

export default function AddonForm({ addon, onSuccess, onCancel }: AddonFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<AddonFormValues>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: addon?.name || '',
      description: addon?.description || '',
      price: String(addon?.price || ''),
      duration: String(addon?.duration || '0'),
      icon: addon?.icon || '➕',
      display_order: String(addon?.display_order || '0'),
      status: addon?.status || 'active',
    },
  })

  const onSubmit = async (data: AddonFormValues) => {
    try {
      setLoading(true)

      const addonData = {
        ...data,
        price: Number(data.price),
        duration: Number(data.duration || 0),
        display_order: Number(data.display_order || 0),
      }

      if (addon) {
        await updateAddon(addon.id, addonData)
        toast({
          title: 'Success',
          description: 'Add-on updated successfully',
        })
      } else {
        await createAddon(addonData as any)
        toast({
          title: 'Success',
          description: 'Add-on created successfully',
        })
      }

      onSuccess()
    } catch (error: any) {
      console.error('Addon error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save add-on',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add-on Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hair Serum Treatment" {...field} />
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
                  placeholder="Brief description of the add-on"
                  {...field}
                  rows={2}
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
                <FormDescription>
                  Additional charge
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Additional time
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter emoji"
                      {...field}
                      className="w-24"
                    />
                    <span className="text-3xl">{field.value}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {ADDON_ICONS.map((item) => (
                      <button
                        key={item.emoji}
                        type="button"
                        onClick={() => field.onChange(item.emoji)}
                        className={`p-2 text-2xl rounded hover:bg-amber-500/20 transition ${
                          field.value === item.emoji ? 'bg-amber-500/30 ring-2 ring-amber-500' : ''
                        }`}
                        title={item.label}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                  Lower numbers first
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600">
            {loading ? 'Saving...' : addon ? 'Update Add-on' : 'Create Add-on'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
