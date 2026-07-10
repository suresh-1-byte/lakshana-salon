'use client'

import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import BookingForm from '@/components/admin/BookingForm'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'confirmed'>('all')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        const filtered = bookings.filter(
          (booking) =>
            booking.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.phone?.includes(searchQuery) ||
            booking.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredBookings(filtered)
      } else {
        setFilteredBookings(bookings)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, bookings])

  useEffect(() => {
    loadBookings()
  }, [filterType])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bookings')
      const data = await res.json()
      
      let bookingsData = data.bookings || []
      
      // Filter by status if needed
      if (filterType !== 'all') {
        bookingsData = bookingsData.filter((b: any) => b.status === filterType)
      }
      
      setBookings(bookingsData)
      setFilteredBookings(bookingsData)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      'no-show': 'bg-gray-500',
      rescheduled: 'bg-purple-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Customer Bookings</h1>
          <p className="text-gray-400 mt-1">Manage website booking requests</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <BookingForm
              onSuccess={() => {
                setShowForm(false)
                loadBookings()
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All Bookings
          </Button>
          <Button
            variant={filterType === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterType('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filterType === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setFilterType('confirmed')}
          >
            Confirmed
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-800">
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-20"></div></TableCell>
                  <TableCell><div className="h-12 bg-gray-800 rounded animate-pulse w-32"></div></TableCell>
                  <TableCell><div className="h-8 bg-gray-800 rounded animate-pulse w-40"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-32"></div></TableCell>
                  <TableCell><div className="h-6 bg-gray-800 rounded animate-pulse w-20"></div></TableCell>
                </TableRow>
              ))
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-gray-800">
                  <TableCell className="font-medium font-mono">
                    #{booking.id?.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-gray-400">{booking.phone}</div>
                      <div className="text-xs text-gray-500">{booking.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {booking.services?.map((service: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          {service.name}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.createdAt
                      ? format(new Date(booking.createdAt), 'MMM dd, yyyy h:mm a')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
