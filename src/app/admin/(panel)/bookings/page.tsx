'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Check,
  CheckCheck,
  X,
  Trash2,
  Pencil,
  RefreshCw,
  MessageCircle,
  CalendarClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogDescription,
  DialogFooter,
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
import BookingForm from '@/components/admin/BookingForm'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show'

interface BookingRow {
  id: string
  name: string
  phone: string
  email: string
  services: Array<{ name: string; duration?: string; member?: string; price?: number }>
  addons?: Array<{ name: string; price: number }>
  status: BookingStatus
  scheduledDate: string | null
  scheduledTime: string | null
  notes: string
  totalAmount?: number | null
  source?: string
  createdAt: string | null
}

const FILTERS: Array<{ value: 'all' | BookingStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500 text-black hover:bg-yellow-500',
  confirmed: 'bg-blue-500 hover:bg-blue-500',
  completed: 'bg-green-600 hover:bg-green-600',
  cancelled: 'bg-red-600 hover:bg-red-600',
  'no-show': 'bg-gray-500 hover:bg-gray-500',
  rescheduled: 'bg-purple-500 hover:bg-purple-500',
}

function formatSchedule(b: BookingRow) {
  if (!b.scheduledDate) return null
  const date = new Date(`${b.scheduledDate}T${b.scheduledTime || '00:00'}`)
  if (isNaN(date.getTime())) return `${b.scheduledDate} ${b.scheduledTime || ''}`
  return b.scheduledTime ? format(date, 'EEE, dd MMM yyyy • h:mm a') : format(date, 'EEE, dd MMM yyyy')
}

function whatsappLink(b: BookingRow) {
  const phone = b.phone.replace(/\D/g, '')
  const number = phone.length === 10 ? `91${phone}` : phone
  const services = b.services.map(s => s.name).join(', ')
  const when = formatSchedule(b)
  let text = `Hello ${b.name},\n\n`
  if (b.status === 'confirmed') {
    text += `Your appointment at Lakshana Beauty Salon is confirmed ✅\n💇 ${services}${when ? `\n📅 ${when}` : ''}\n\nSee you soon!`
  } else if (b.status === 'cancelled') {
    text += `Your appointment for ${services} at Lakshana Beauty Salon has been cancelled. Please reply to rebook.`
  } else if (b.status === 'completed') {
    text += `Thank you for visiting Lakshana Beauty Salon! We hope you loved your ${services}. ✨`
  } else {
    text += `Thank you for booking ${services} at Lakshana Beauty Salon. When would you like to come in?`
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<'all' | BookingStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  // Confirm / edit dialog
  const [editing, setEditing] = useState<BookingRow | null>(null)
  const [editStatus, setEditStatus] = useState<BookingStatus>('confirmed')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load bookings')
      setBookings(data.data || [])
    } catch (error: any) {
      console.error('Error loading bookings:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load bookings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length }
    bookings.forEach(b => { c[b.status] = (c[b.status] || 0) + 1 })
    return c
  }, [bookings])

  const visibleBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterType !== 'all' && b.status !== filterType) return false
      if (!debouncedSearch) return true
      return (
        b.name?.toLowerCase().includes(debouncedSearch) ||
        b.phone?.includes(debouncedSearch) ||
        b.email?.toLowerCase().includes(debouncedSearch) ||
        b.id.toLowerCase().includes(debouncedSearch.replace('#', ''))
      )
    })
  }, [bookings, filterType, debouncedSearch])

  const updateBooking = async (
    booking: BookingRow,
    changes: Partial<Pick<BookingRow, 'status' | 'scheduledDate' | 'scheduledTime' | 'notes'>>
  ) => {
    const res = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      let message = data.error || 'Failed to update booking'
      if (data.shortfall) {
        message += ` (needs ₹${data.requiredAmount}, package has ₹${data.availableBalance})`
      }
      throw new Error(message)
    }
    const updated: BookingRow = data.data
    setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, ...updated } : b)))
    return updated
  }

  const quickStatus = async (booking: BookingRow, status: BookingStatus) => {
    if (status === 'cancelled' && !confirm(`Cancel the booking for ${booking.name}?`)) return
    try {
      setBusyId(booking.id)
      await updateBooking(booking, { status })
      toast({ title: 'Booking updated', description: `${booking.name}'s booking is now ${status}.` })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const deleteBooking = async (booking: BookingRow) => {
    if (!confirm(`Permanently delete the booking for ${booking.name}? This cannot be undone.`)) return
    try {
      setBusyId(booking.id)
      const res = await fetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete booking')
      setBookings(prev => prev.filter(b => b.id !== booking.id))
      toast({ title: 'Deleted', description: 'Booking deleted' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const openEditor = (booking: BookingRow, status?: BookingStatus) => {
    setEditing(booking)
    setEditStatus(status || booking.status)
    setEditDate(booking.scheduledDate || '')
    setEditTime(booking.scheduledTime || '')
    setEditNotes(booking.notes || '')
  }

  const saveEditor = async () => {
    if (!editing) return
    try {
      setSaving(true)
      const updated = await updateBooking(editing, {
        status: editStatus,
        scheduledDate: editDate,
        scheduledTime: editTime,
        notes: editNotes,
      })
      toast({
        title: editStatus === 'confirmed' && editing.status !== 'confirmed' ? 'Booking confirmed' : 'Booking saved',
        description: `${editing.name} — ${updated.status}`,
      })
      setEditing(null)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Customer Bookings</h1>
          <p className="text-gray-400 mt-1">Confirm, schedule and manage appointment requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBookings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              {showForm && (
                <BookingForm
                  onSuccess={() => {
                    setShowForm(false)
                    loadBookings()
                  }}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by customer name, phone, email or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <Button
              key={f.value}
              variant={filterType === f.value ? 'default' : 'outline'}
              onClick={() => setFilterType(f.value)}
            >
              {f.label}
              <span className="ml-2 text-xs opacity-70">{counts[f.value] || 0}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Appointment</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && bookings.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-800">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-gray-800 rounded animate-pulse w-24"></div></TableCell>
                  ))}
                </TableRow>
              ))
            ) : visibleBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              visibleBookings.map((booking) => {
                const busy = busyId === booking.id
                const schedule = formatSchedule(booking)
                const canConfirm = booking.status === 'pending' || booking.status === 'rescheduled'
                const canComplete = booking.status === 'confirmed'
                const canCancel = !['cancelled', 'completed'].includes(booking.status)
                return (
                  <TableRow key={booking.id} className="border-gray-800 align-top">
                    <TableCell className="font-medium font-mono">
                      #{booking.id?.slice(-6).toUpperCase()}
                      {booking.source === 'admin' && (
                        <div className="text-[10px] text-gray-500 font-sans">walk-in / phone</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-gray-400">{booking.phone}</div>
                      {booking.email && <div className="text-xs text-gray-500">{booking.email}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {booking.services?.map((service, idx) => (
                          <div key={idx} className="text-sm">
                            {service.name}
                            {service.member && <span className="text-gray-500"> · {service.member}</span>}
                          </div>
                        ))}
                        {booking.addons?.map((addon, idx) => (
                          <div key={`a${idx}`} className="text-xs text-amber-400/80">+ {addon.name}</div>
                        ))}
                        {booking.notes && (
                          <div className="text-xs text-gray-500 italic max-w-[220px] truncate" title={booking.notes}>
                            “{booking.notes}”
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {schedule ? (
                        <span className="text-gray-200">{schedule}</span>
                      ) : (
                        <span className="text-gray-500">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {booking.createdAt ? format(new Date(booking.createdAt), 'dd MMM yyyy, h:mm a') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[booking.status] || 'bg-gray-500'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {canConfirm && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={busy}
                            onClick={() => openEditor(booking, 'confirmed')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {canComplete && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={busy}
                            onClick={() => quickStatus(booking, 'completed')}
                          >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
                            disabled={busy}
                            onClick={() => quickStatus(booking, 'cancelled')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          title="Edit / reschedule"
                          disabled={busy}
                          onClick={() => openEditor(booking)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-green-400 hover:text-green-300"
                          title="Message on WhatsApp"
                          asChild
                        >
                          <a href={whatsappLink(booking)} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-red-500 hover:text-red-400"
                          title="Delete booking"
                          disabled={busy}
                          onClick={() => deleteBooking(booking)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm / edit booking */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              {editing && editStatus === 'confirmed' && editing.status !== 'confirmed'
                ? 'Confirm Booking'
                : 'Edit Booking'}
            </DialogTitle>
            {editing && (
              <DialogDescription>
                {editing.name} · {editing.phone}
                <br />
                {editing.services.map(s => s.name).join(', ')}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Appointment date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-time">Time</Label>
                <Input
                  id="booking-time"
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as BookingStatus)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-notes">Notes</Label>
              <Textarea
                id="booking-notes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Stylist, special requests…"
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Close
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={saveEditor} disabled={saving}>
              {saving
                ? 'Saving…'
                : editing && editStatus === 'confirmed' && editing.status !== 'confirmed'
                  ? 'Confirm Booking'
                  : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
