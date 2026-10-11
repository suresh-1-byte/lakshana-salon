'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, X, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllServices } from '@/lib/api/services'
import { getAllAddons } from '@/lib/api/service-addons'
import { getCustomerByMobile } from '@/lib/api/customers'
import { toast } from '@/hooks/use-toast'
import type { Service, ServiceAddon } from '@/types/database.types'

interface BookingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

/** A prepaid package or membership wallet the booking can be charged to */
interface PrepaidOption {
  id: string
  kind: 'package' | 'membership'
  label: string
  customerId?: string
  customerName: string
  customerPhone: string
  balance: number
}

const NONE = 'none'

function formatDuration(minutes: number) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} hr${m ? ` ${m} min` : ''}` : `${m} min`
}

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [services, setServices] = useState<Service[]>([])
  const [addons, setAddons] = useState<ServiceAddon[]>([])
  const [prepaid, setPrepaid] = useState<PrepaidOption[]>([])

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [knownCustomer, setKnownCustomer] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [serviceToAdd, setServiceToAdd] = useState('')
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [prepaidId, setPrepaidId] = useState<string>(NONE)
  const [memberPricing, setMemberPricing] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [advance, setAdvance] = useState('0')
  const [totalOverride, setTotalOverride] = useState<string | null>(null)
  const [confirmNow, setConfirmNow] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [svc, add, pkgRes, memRes] = await Promise.allSettled([
        getAllServices(true),
        getAllAddons(true),
        fetch('/api/admin/customer-packages?status=active', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/admin/membership-wallets?status=active', { cache: 'no-store' }).then(r => r.json()),
      ])
      if (cancelled) return

      if (svc.status === 'fulfilled') setServices(svc.value)
      else toast({ title: 'Could not load services', description: String(svc.reason?.message || svc.reason), variant: 'destructive' })
      if (add.status === 'fulfilled') setAddons(add.value)

      const options: PrepaidOption[] = []
      if (pkgRes.status === 'fulfilled') {
        for (const p of pkgRes.value?.packages || []) {
          if (p.status !== 'active') continue
          options.push({
            id: `package:${p.id}`,
            kind: 'package',
            label: p.packageName || 'Prepaid Package',
            customerId: p.customerId,
            customerName: p.customer?.name || p.customerName || '',
            customerPhone: p.customer?.phone || p.customerPhone || '',
            balance: Number(p.availableBalance) || 0,
          })
        }
      }
      if (memRes.status === 'fulfilled') {
        for (const m of memRes.value?.memberships || []) {
          if (m.status !== 'active') continue
          options.push({
            id: `membership:${m.id}`,
            kind: 'membership',
            label: m.packageName || 'Membership',
            customerId: m.customerId,
            customerName: m.customer?.name || m.customerName || '',
            customerPhone: m.customer?.phone || m.customerPhone || '',
            balance: Number(m.availableBalance) || 0,
          })
        }
      }
      setPrepaid(options)
      setLoadingData(false)
    })()
    return () => { cancelled = true }
  }, [])

  // Services grouped by category for the dropdown
  const groupedServices = useMemo(() => {
    const groups = new Map<string, Service[]>()
    services.forEach(s => {
      const key = s.category || 'Other'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(s)
    })
    return Array.from(groups.entries())
  }, [services])

  const selectedServices = selectedServiceIds
    .map(id => services.find(s => s.id === id))
    .filter(Boolean) as Service[]
  const selectedAddons = addons.filter(a => selectedAddonIds.includes(a.id))
  const selectedPrepaid = prepaid.find(p => p.id === prepaidId) || null

  const priceOf = (s: Service) => (memberPricing && s.offer_price ? s.offer_price : s.price)
  const servicesTotal = selectedServices.reduce((sum, s) => sum + priceOf(s), 0)
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const computedTotal = servicesTotal + addonsTotal
  const total = totalOverride !== null ? Number(totalOverride) || 0 : computedTotal
  const duration =
    selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0) +
    selectedAddons.reduce((sum, a) => sum + (a.duration || 0), 0)

  const addService = (id: string) => {
    if (!id) return
    setSelectedServiceIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    setServiceToAdd('')
    setTotalOverride(null)
  }

  const removeService = (id: string) => {
    setSelectedServiceIds(prev => prev.filter(x => x !== id))
    setTotalOverride(null)
  }

  const toggleAddon = (id: string) => {
    setSelectedAddonIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    setTotalOverride(null)
  }

  // Look up an existing customer when the mobile number is entered
  const lookupCustomer = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setKnownCustomer(null)
      return
    }
    try {
      const customer = await getCustomerByMobile(phone)
      if (customer) {
        setKnownCustomer(customer.full_name)
        if (!name) setName(customer.full_name)
        if (!email && customer.email) setEmail(customer.email)
        // Pre-select this customer's active package / membership
        const own = prepaid.find(
          p => p.customerId === customer.id || p.customerPhone.replace(/\D/g, '').endsWith(digits.slice(-10))
        )
        if (own && prepaidId === NONE) {
          setPrepaidId(own.id)
          if (own.kind === 'membership') setMemberPricing(true)
        }
      } else {
        setKnownCustomer(null)
      }
    } catch {
      setKnownCustomer(null)
    }
  }

  const choosePrepaid = (id: string) => {
    setPrepaidId(id)
    const option = prepaid.find(p => p.id === id)
    if (option) {
      if (option.customerName) setName(option.customerName)
      if (option.customerPhone) setPhone(option.customerPhone)
      setKnownCustomer(option.customerName || null)
      if (option.kind === 'membership') setMemberPricing(true)
    }
    setTotalOverride(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim().length < 2) return toast({ title: 'Customer name is required', variant: 'destructive' })
    if (phone.replace(/\D/g, '').length < 10) return toast({ title: 'Enter a valid 10-digit mobile number', variant: 'destructive' })
    if (selectedServices.length === 0) return toast({ title: 'Select at least one service', variant: 'destructive' })
    if (!date || !time) return toast({ title: 'Choose the appointment date and time', variant: 'destructive' })

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          services: selectedServices.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            duration: (s as any).duration_label || formatDuration(s.duration),
            member: `₹${priceOf(s).toLocaleString('en-IN')}`,
            price: priceOf(s),
          })),
          addons: selectedAddons.map(a => ({ id: a.id, name: a.name, price: a.price })),
          scheduledDate: date,
          scheduledTime: time,
          duration,
          notes: [
            notes.trim(),
            selectedPrepaid ? `Charge to ${selectedPrepaid.kind}: ${selectedPrepaid.label}` : '',
          ].filter(Boolean).join('\n'),
          totalAmount: total,
          advanceAmount: Number(advance) || 0,
          membershipId: selectedPrepaid?.kind === 'membership' ? selectedPrepaid.id.split(':')[1] : null,
          status: confirmNow ? 'confirmed' : 'pending',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create booking')

      if (data.warning) {
        toast({ title: 'Booking created', description: data.warning })
      } else {
        toast({
          title: 'Booking created',
          description: `${name} — ${confirmNow ? 'confirmed' : 'pending'} for ${date} at ${time}`,
        })
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Booking error:', error)
      toast({ title: 'Error', description: error.message || 'Failed to create booking', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bf-phone">Mobile Number *</Label>
          <Input
            id="bf-phone"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={lookupCustomer}
            inputMode="tel"
          />
          {knownCustomer && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Existing customer: {knownCustomer}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bf-name">Customer Name *</Label>
          <Input id="bf-name" placeholder="Enter customer name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bf-email">Email</Label>
          <Input id="bf-email" type="email" placeholder="Optional" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      {/* Package / membership */}
      <div className="space-y-2">
        <Label>Package / Membership</Label>
        <Select value={prepaidId} onValueChange={choosePrepaid} disabled={loadingData}>
          <SelectTrigger>
            <SelectValue placeholder={loadingData ? 'Loading…' : 'Select package'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No package — pay at salon</SelectItem>
            {prepaid.length === 0 && !loadingData && (
              <div className="px-8 py-2 text-xs text-gray-500">No active packages or memberships</div>
            )}
            {prepaid.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.customerName || 'Customer'} — {p.label} (₹{p.balance.toLocaleString('en-IN')} left)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPrepaid && total > selectedPrepaid.balance && (
          <p className="text-xs text-red-400">
            Total ₹{total.toLocaleString('en-IN')} is more than the remaining balance ₹{selectedPrepaid.balance.toLocaleString('en-IN')}.
          </p>
        )}
      </div>

      {/* Services */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Services *</Label>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <Checkbox checked={memberPricing} onCheckedChange={(v) => { setMemberPricing(!!v); setTotalOverride(null) }} />
            Use member prices
          </label>
        </div>
        <Select value={serviceToAdd} onValueChange={addService} disabled={loadingData}>
          <SelectTrigger>
            <SelectValue placeholder={loadingData ? 'Loading services…' : services.length ? 'Add a service' : 'No services found'} />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {groupedServices.map(([category, list]) => (
              <SelectGroup key={category}>
                <SelectLabel className="text-amber-400">{category}</SelectLabel>
                {list.map(service => (
                  <SelectItem key={service.id} value={service.id} disabled={selectedServiceIds.includes(service.id)}>
                    {service.name} — ₹{priceOf(service).toLocaleString('en-IN')}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {selectedServices.length > 0 && (
          <div className="rounded-lg border border-gray-800 divide-y divide-gray-800">
            {selectedServices.map(s => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{(s as any).duration_label || formatDuration(s.duration)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">₹{priceOf(s).toLocaleString('en-IN')}</span>
                  <button type="button" onClick={() => removeService(s.id)} className="text-gray-500 hover:text-red-400" aria-label={`Remove ${s.name}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="space-y-2">
          <Label>Add-ons</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {addons.map(addon => {
              const isSelected = selectedAddonIds.includes(addon.id)
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 border rounded-lg text-left text-sm transition-all ${
                    isSelected ? 'bg-amber-900/30 border-amber-500' : 'border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{addon.icon} {addon.name}</span>
                    <span className="text-amber-400 font-semibold">+₹{addon.price}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bf-date">Date *</Label>
          <Input id="bf-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bf-time">Time *</Label>
          <Input id="bf-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <div className="h-10 flex items-center px-3 rounded-md border border-input text-sm text-gray-400">
            {duration ? formatDuration(duration) : '—'}
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bf-total">Total Amount (₹)</Label>
          <Input
            id="bf-total"
            type="number"
            min={0}
            value={totalOverride ?? String(computedTotal)}
            onChange={(e) => setTotalOverride(e.target.value)}
          />
          {totalOverride !== null && Number(totalOverride) !== computedTotal && (
            <button type="button" className="text-xs text-amber-400 underline" onClick={() => setTotalOverride(null)}>
              Reset to ₹{computedTotal.toLocaleString('en-IN')}
            </button>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bf-advance">Advance Paid (₹)</Label>
          <Input id="bf-advance" type="number" min={0} value={advance} onChange={(e) => setAdvance(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bf-notes">Notes</Label>
        <Textarea id="bf-notes" rows={3} placeholder="Stylist, special requests…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={confirmNow} onCheckedChange={(v) => setConfirmNow(!!v)} />
        Mark as confirmed now
      </label>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || loadingData} className="bg-amber-500 hover:bg-amber-600 text-black">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Booking
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
