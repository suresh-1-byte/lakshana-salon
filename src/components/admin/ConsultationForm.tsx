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
import { toast } from '@/hooks/use-toast'

// Create consultation via API
async function createConsultationAPI(data: any) {
  const response = await fetch('/api/admin/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create consultation');
  }
  
  return result;
}

// Fetch customers via API
async function fetchCustomers() {
  const response = await fetch('/api/admin/customers');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch customers');
  }
  
  return data.data;
}

const consultationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  consultationDate: z.string().min(1, 'Date is required'),
  hairType: z.string().optional(),
  skinType: z.string().optional(),
  problems: z.string().optional(),
  suggestions: z.string().optional(),
  recommendedServices: z.string().optional(),
  recommendedProducts: z.string().optional(),
  notes: z.string().optional(),
  nextVisit: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
})

type ConsultationFormValues = z.infer<typeof consultationSchema>

interface ConsultationFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function ConsultationForm({ onSuccess, onCancel }: ConsultationFormProps) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      customerId: '',
      consultationDate: new Date().toISOString().split('T')[0],
      hairType: '',
      skinType: '',
      problems: '',
      suggestions: '',
      recommendedServices: '',
      recommendedProducts: '',
      notes: '',
      nextVisit: '',
      status: 'completed',
    },
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const onSubmit = async (data: ConsultationFormValues) => {
    try {
      setLoading(true)

      // Convert comma-separated strings to arrays
      const recommendedServices = data.recommendedServices
        ? data.recommendedServices.split(',').map(s => s.trim()).filter(Boolean)
        : []
      
      const recommendedProducts = data.recommendedProducts
        ? data.recommendedProducts.split(',').map(p => p.trim()).filter(Boolean)
        : []

      await createConsultationAPI({
        customerId: data.customerId,
        consultantId: null,
        consultationDate: data.consultationDate,
        hairType: data.hairType || null,
        skinType: data.skinType || null,
        problems: data.problems || null,
        suggestions: data.suggestions || null,
        recommendedServices,
        recommendedProducts,
        notes: data.notes || null,
        nextVisit: data.nextVisit || null,
        status: data.status,
      })

      toast({
        title: 'Success',
        description: 'Consultation created successfully',
      })

      onSuccess()
    } catch (error: any) {
      console.error('Consultation error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create consultation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consultationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hairType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hair Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Straight">Straight</SelectItem>
                    <SelectItem value="Wavy">Wavy</SelectItem>
                    <SelectItem value="Curly">Curly</SelectItem>
                    <SelectItem value="Coily">Coily</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skinType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skin Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skin type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Oily">Oily</SelectItem>
                    <SelectItem value="Combination">Combination</SelectItem>
                    <SelectItem value="Sensitive">Sensitive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="problems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problems / Concerns</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the customer's hair/skin concerns..."
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
          name="suggestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suggestions / Recommendations</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your professional recommendations..."
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
            name="recommendedServices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Services</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Service 1, Service 2, Service 3"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-neutral-500">Separate with commas</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendedProducts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Products</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Product 1, Product 2, Product 3"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-neutral-500">Separate with commas</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextVisit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Visit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes..." {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600">
            {loading ? 'Creating...' : 'Create Consultation'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
