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
import { Card } from '@/components/ui/card'
import { getCategoriesWithServices } from '@/lib/api/service-categories'
import { Check } from 'lucide-react'
import type { Service, ServiceCategory } from '@/types/database.types'

const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  mobile_number: z.string().min(10, 'Valid mobile number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface CategoryWithServices extends ServiceCategory {
  services: Service[]
}

export default function EnhancedBookingForm() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryWithServices[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [serviceAddons, setServiceAddons] = useState<Record<string, any[]>>({}) // Store addons per service
  const [selectedAddons, setSelectedAddons] = useState<Record<string, any[]>>({}) // Selected addons per service

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: '',
      mobile_number: '',
      email: '',
      appointment_date: '',
      appointment_time: '',
      notes: '',
    },
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesWithServices()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedServices([]) // Reset selected services when category changes
  }

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id)
      if (exists) {
        return prev.filter(s => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId)
  }

  const calculateTotalPrice = () => {
    return selectedServices.reduce((sum, service) => {
      return sum + (service.offer_price || service.price)
    }, 0)
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0)
  }

  const onSubmit = async (data: BookingFormValues) => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }

    try {
      setLoading(true)

      const bookingData = {
        ...data,
        selected_services: selectedServices.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: s.offer_price || s.price,
          duration: s.duration,
        })),
        total_amount: calculateTotalPrice(),
        duration: calculateTotalDuration(),
      }

      // TODO: Submit to your API endpoint
      console.log('Booking Data:', bookingData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) throw new Error('Booking failed')

      alert('Booking submitted successfully! We will contact you shortly.')
      form.reset()
      setSelectedCategory(null)
      setSelectedServices([])
    } catch (error: any) {
      console.error('Booking error:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = categories.find(c => c.id === selectedCategory)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-amber-400 mb-2">Book Your Appointment</h2>
        <p className="text-gray-400">Choose services and schedule your visit</p>
      </div>

      {/* Step 1: Select Category */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-amber-300">Step 1: Choose Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer p-6 text-center transition-all hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-amber-500/20 border-2 border-amber-500'
                  : 'bg-gray-800 border-gray-700 hover:border-amber-500/50'
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="text-4xl mb-2">{category.icon || '📋'}</div>
              <h4 className="font-semibold text-white">{category.name}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {category.services.length} services
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 2: Select Services */}
      {selectedCategory && currentCategory && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-amber-300">
            Step 2: Select Services from {currentCategory.icon} {currentCategory.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCategory.services.map((service) => {
              const isSelected = isServiceSelected(service.id)
              return (
                <Card
                  key={service.id}
                  className={`cursor-pointer p-5 transition-all hover:scale-102 ${
                    isSelected
                      ? 'bg-amber-500/20 border-2 border-amber-500'
                      : 'bg-gray-800 border-gray-700 hover:border-amber-500/50'
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-white mb-1">
                        {service.name}
                      </h4>
                      {service.description && (
                        <p className="text-sm text-gray-400 mb-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-amber-400 font-semibold">
                          {service.offer_price ? (
                            <>
                              <span className="line-through text-gray-500 mr-2">
                                ₹{service.price}
                              </span>
                              ₹{service.offer_price}
                            </>
                          ) : (
                            `₹${service.price}`
                          )}
                        </span>
                        <span className="text-gray-400">• {service.duration} min</span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-gray-500'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-amber-900/20 border-2 border-amber-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">Selected Services</h3>
          <div className="space-y-2 mb-4">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between text-white">
                <span>{service.name}</span>
                <span className="text-amber-400">
                  ₹{service.offer_price || service.price}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-amber-500/30 pt-4 space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-white">Total Amount:</span>
              <span className="text-amber-400">₹{calculateTotalPrice()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Estimated Duration:</span>
              <span>{calculateTotalDuration()} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Customer Details & Schedule */}
      {selectedServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-amber-300">Step 3: Your Details & Schedule</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
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
                      <FormLabel className="text-white">Mobile Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter mobile number"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email (optional)"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="hidden md:block" />

                <FormField
                  control={form.control}
                  name="appointment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Preferred Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                          min={new Date().toISOString().split('T')[0]}
                        />
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
                      <FormLabel className="text-white">Preferred Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
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
                    <FormLabel className="text-white">Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or notes"
                        {...field}
                        rows={3}
                        className="bg-gray-800 border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 text-lg"
              >
                {loading ? 'Submitting...' : `Book Now - ₹${calculateTotalPrice()}`}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}
