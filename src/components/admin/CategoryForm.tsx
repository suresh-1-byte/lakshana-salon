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
import { createCategory, updateCategory } from '@/lib/api/service-categories'
import { toast } from '@/hooks/use-toast'
import type { ServiceCategory } from '@/types/database.types'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.string().min(1, 'Display order is required'),
  status: z.enum(['active', 'inactive']),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: ServiceCategory | null
  onSuccess: () => void
  onCancel: () => void
}

const EMOJI_ICONS = [
  { emoji: '🧵', label: 'Threading' },
  { emoji: '💇', label: 'Hair' },
  { emoji: '💄', label: 'Makeup' },
  { emoji: '✨', label: 'Facial' },
  { emoji: '🪒', label: 'Waxing' },
  { emoji: '💅', label: 'Nails' },
  { emoji: '💆', label: 'Massage' },
  { emoji: '🧖', label: 'Spa' },
  { emoji: '🌸', label: 'Beauty' },
  { emoji: '💐', label: 'Bridal' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '✂️', label: 'Cutting' },
]

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || '📋',
      display_order: String(category?.display_order || 0),
      status: category?.status || 'active',
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true)

      const categoryData = {
        ...data,
        display_order: Number(data.display_order),
      }

      if (category) {
        await updateCategory(category.id, categoryData)
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        })
      } else {
        await createCategory(categoryData as any)
        toast({
          title: 'Success',
          description: 'Category created successfully',
        })
      }

      onSuccess()
    } catch (error: any) {
      console.error('Category error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category',
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
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Threading, Hair, Makeup" {...field} />
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
                  placeholder="Brief description of this category"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      placeholder="Enter emoji or icon"
                      {...field}
                      className="w-24"
                    />
                    <span className="text-3xl">{field.value}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJI_ICONS.map((item) => (
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
              <FormDescription>
                Select an emoji icon for this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1"
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
