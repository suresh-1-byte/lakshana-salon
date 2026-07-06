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
import { createAppointment } from '@/lib/api/appointments'
import { getAllServices } from '@/lib/api/services'
import { getPackages } from '@/lib/api/packages'
import { getCustomerByMobile, createCustomer } from '@/lib/api/customers'
import { getAllAddons } from '@/lib/api/service-addons'
import { toast } from '@/hooks/use-toast'
import type { Service, Package, ServiceAddon } from '@/types/database.types'

const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  mobile_number: z.string().min(10, 'Valid mobile number required'),
  service_id: z.string().optional(),
  package_id: z.string().optional(),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  notes: z.string().optional(),
  advance_amount: z.string().optional(),
  total_amount: z.string().min(1, 'Amount is required'),
  addons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  })).optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface BookingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [addons, setAddons] = useState<ServiceAddon[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: '',
      mobile_number: '',
      service_id: '',
      package_id: '',
      appointment_date: '',
      appointment_time: '',
      duration: '60',
      notes: '',
      advance_amount: '0',
      total_amount: '0',
      addons: [],
    },
  })

  useEffect(() => {
    loadServices()
    loadPackages()
    loadAddons()
  }, [])

  const loadServices = async () => {
    try {
      const data = await getAllServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadPackages = async () => {
    try {
      const data = await getPackages()
      setPackages(data)
    } catch (error) {
      console.error('Error loading packages:', error)
    }
  }

  const loadAddons = async () => {
    try {
      const data = await getAllAddons()
      setAddons(data.filter((addon: ServiceAddon) => addon.status === 'active'))
    } catch (error) {
      console.error('Error loading addons:', error)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      const baseAmount = service.offer_price || service.price
      const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
      const total = baseAmount + addonsTotal
      setTotalAmount(total)
      form.setValue('total_amount', String(total))
      form.setValue('duration', String(service.duration))
    }
  }

  const handleAddonToggle = (addon: ServiceAddon) => {
    const isSelected = selectedAddons.some((a) => a.id === addon.id)
    let newAddons: ServiceAddon[] = []
    
    if (isSelected) {
      // Remove addon
      newAddons = selectedAddons.filter((a) => a.id !== addon.id)
    } else {
      // Add addon
      newAddons = [...selectedAddons, addon]
    }
    
    setSelectedAddons(newAddons)
    form.setValue('addons', newAddons as any)
    
    // Recalculate total
    const baseAmount = selectedService ? (selectedService.offer_price || selectedService.price) : 0
    const addonsTotal = newAddons.reduce((sum, a) => sum + a.price, 0)
    const total = baseAmount + addonsTotal
    setTotalAmount(total)
    form.setValue('total_amount', String(total))
  }

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setLoading(true)

      // Check if customer exists, create if not
      let customer = await getCustomerByMobile(data.mobile_number)
      
      if (!customer) {
        customer = await createCustomer({
          full_name: data.customer_name,
          mobile_number: data.mobile_number,
          whatsapp_number: data.mobile_number,
        })
      }

      // Create appointment with add-ons
      const appointment = await createAppointment({
        booking_id: `BK${Date.now()}`,
        customer_id: customer.id,
        customer_name: data.customer_name,
        customer_phone: data.mobile_number,
        service_id: data.service_id || null,
        package_id: data.package_id || null,
        staff_id: null,
        staff_name: null,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        duration: Number(data.duration),
        notes: data.notes || '',
        advance_amount: Number(data.advance_amount || 0),
        balance_amount: Number(data.total_amount) - Number(data.advance_amount || 0),
        total_amount: Number(data.total_amount),
        booking_status: 'confirmed',
        payment_status: Number(data.advance_amount || 0) > 0 ? 'partial' : 'pending',
        addons: selectedAddons,
      })

      // Note: Google Sheets sync happens server-side via API

      // Send WhatsApp confirmation
      try {
        const template = `✅ Booking Confirmed!\n\nHello ${data.customer_name},\n\nYour booking has been confirmed.\n📅 Date: ${data.appointment_date}\n⏰ Time: ${data.appointment_time}\n💇 Service: ${selectedService?.name || 'Service'}\n\n${selectedAddons.length > 0 ? `Add-ons:\n${selectedAddons.map(a => `• ${a.name} - ₹${a.price}`).join('\n')}\n\n` : ''}💰 Total Amount: ₹${data.total_amount}\n\nThank you for choosing Lakshana Beauty Salon! ✨`
        
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: customer.id,
            customerName: data.customer_name,
            customerPhone: data.mobile_number,
            messageType: 'template',
            content: template,
            templateName: 'booking_confirmation',
          }),
        })
      } catch (error) {
        console.error('WhatsApp send failed:', error)
      }

      // Create notification
      try {
        await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointment.id,
            customerName: data.customer_name,
          }),
        })
      } catch (error) {
        console.error('Notification failed:', error)
      }

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      })

      onSuccess()
    } catch (error: any) {
      console.error('Booking error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking',
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
            name="customer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleServiceChange(value)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ₹{service.offer_price || service.price}
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
            name="package_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.package_name} - ₹{pkg.offer_price || pkg.price}
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
            name="appointment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointment_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="60" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advance_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Add-ons Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add-on Options</h3>
            <span className="text-sm text-neutral-600">
              {selectedAddons.length} selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {addons.map((addon) => {
              const isSelected = selectedAddons.some((a) => a.id === addon.id)
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => handleAddonToggle(addon)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/20'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{addon.name}</p>
                      <p className="text-sm text-amber-600 font-semibold mt-1">
                        +₹{addon.price}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-amber-500 border-amber-500' : 'border-neutral-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedAddons.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">Base Service Amount:</span>
                  <span className="font-medium">₹{selectedService ? (selectedService.offer_price || selectedService.price) : 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">Add-ons Total:</span>
                  <span className="font-medium text-amber-600">
                    +₹{selectedAddons.reduce((sum, addon) => sum + addon.price, 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-bold">
                  <span>Total Amount:</span>
                  <span className="text-lg text-amber-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any notes" {...field} rows={3} />
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
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
