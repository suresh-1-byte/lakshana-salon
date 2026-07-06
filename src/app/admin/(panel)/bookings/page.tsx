'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Calendar, Clock, User, DollarSign } from 'lucide-react'
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
import { getAppointments, getTodaysAppointments } from '@/lib/api/appointments'
import BookingForm from '@/components/admin/BookingForm'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function BookingsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'today'>('all')

  useEffect(() => {
    loadAppointments()
  }, [filterType])

  useEffect(() => {
    if (searchQuery) {
      const filtered = appointments.filter(
        (apt) =>
          apt.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.customers?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.customers?.mobile_number.includes(searchQuery)
      )
      setFilteredAppointments(filtered)
    } else {
      setFilteredAppointments(appointments)
    }
  }, [searchQuery, appointments])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const data =
        filterType === 'today' ? await getTodaysAppointments() : await getAppointments()
      setAppointments(data)
      setFilteredAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      'no-show': 'bg-gray-500',
      rescheduled: 'bg-yellow-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500',
      partial: 'bg-yellow-500',
      pending: 'bg-orange-500',
      refunded: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Appointment Bookings</h1>
          <p className="text-gray-400 mt-1">Manage salon appointments</p>
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
                loadAppointments()
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
            placeholder="Search by booking ID, customer name, or mobile..."
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
            variant={filterType === 'today' ? 'default' : 'outline'}
            onClick={() => setFilterType('today')}
          >
            Today's Bookings
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Stylist</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booking Status</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id} className="border-gray-800">
                  <TableCell className="font-medium">{appointment.booking_id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.customers?.full_name}</div>
                      <div className="text-sm text-gray-400">
                        {appointment.customers?.mobile_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{appointment.services?.name || '-'}</div>
                      {appointment.addons && appointment.addons.length > 0 && (
                        <div className="text-xs text-amber-400 mt-1">
                          +{appointment.addons.length} add-on{appointment.addons.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {format(new Date(appointment.appointment_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{appointment.appointment_time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {appointment.staff?.staff_name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      ₹{appointment.total_amount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.booking_status)}>
                      {appointment.booking_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                      {appointment.payment_status}
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
