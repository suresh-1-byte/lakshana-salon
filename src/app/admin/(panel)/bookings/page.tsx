'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, RefreshCw, CalendarCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Booking } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const STATUS_OPTS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [notes, setNotes] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/bookings?${params}`);
    const data = await res.json();
    if (data.success) setBookings(data.data);
    else {
      // Fallback to public bookings endpoint
      const r2 = await fetch('/api/bookings');
      const d2 = await r2.json();
      if (d2.bookings) setBookings(d2.bookings);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBookings, 300);
    return () => clearTimeout(t);
  }, [fetchBookings]);

  const openDetail = (b: Booking) => {
    setSelectedBooking(b);
    setSchedDate(b.scheduledDate || '');
    setSchedTime(b.scheduledTime || '');
    setNotes(b.notes || '');
    setDetailOpen(true);
  };

  const updateBooking = async (id: string, payload: Record<string, unknown>) => {
    setUpdating(true);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast({ title: 'Booking updated successfully' });
      setDetailOpen(false);
      fetchBookings();
    } else {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
    setUpdating(false);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Permanently delete this booking?')) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Booking deleted' });
      fetchBookings();
      setDetailOpen(false);
    }
  };

  // Stats
  const counts = STATUS_OPTS.slice(1).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: 'name' as keyof Booking,
      label: 'Customer',
      render: (b: Booking) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
            {b.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{b.name}</p>
            <p className="text-white/40 text-[11px]">{b.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'services' as keyof Booking,
      label: 'Services',
      render: (b: Booking) => (
        <div>
          <p className="text-white/70 text-sm">{b.services?.[0]?.name || '—'}</p>
          {(b.services?.length ?? 0) > 1 && (
            <p className="text-white/30 text-[11px]">+{(b.services?.length ?? 0) - 1} more</p>
          )}
        </div>
      ),
    },
    {
      key: 'status' as keyof Booking,
      label: 'Status',
      render: (b: Booking) => <StatusBadge status={b.status} />,
    },
    {
      key: 'scheduledDate' as keyof Booking,
      label: 'Scheduled',
      render: (b: Booking) => (
        b.scheduledDate ? (
          <div className="text-white/60 text-sm">
            <p className="flex items-center gap-1"><Calendar size={11} className="text-[#D4447A]" /> {b.scheduledDate}</p>
            {b.scheduledTime && <p className="flex items-center gap-1 mt-0.5"><Clock size={11} className="text-[#D4447A]" /> {b.scheduledTime}</p>}
          </div>
        ) : <span className="text-white/20 text-xs">Not scheduled</span>
      ),
    },
    {
      key: 'createdAt' as keyof Booking,
      label: 'Received',
      render: (b: Booking) => (
        <span className="text-white/30 text-[11px]">
          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status summary pills */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { key: 'pending',     color: '#EAB308' },
          { key: 'confirmed',   color: '#22C55E' },
          { key: 'completed',   color: '#818CF8' },
          { key: 'cancelled',   color: '#EF4444' },
          { key: 'rescheduled', color: '#F97316' },
        ].map(({ key, color }) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className="rounded-2xl p-3 text-center transition-all hover:scale-[1.02]"
            style={{
              background: statusFilter === key ? `${color}18` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${statusFilter === key ? color + '40' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <p className="text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: statusFilter === key ? color : 'white' }}>
              {counts[key] ?? 0}
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] capitalize mt-0.5" style={{ color: statusFilter === key ? color : 'rgba(255,255,255,0.3)' }}>
              {key}
            </p>
          </button>
        ))}
        <Link href="/admin/bookings/calendar"
          className="rounded-2xl p-3 text-center transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1"
          style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.2)' }}>
          <Calendar size={18} className="text-[#D4447A]" />
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#D4447A]">Calendar</p>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 text-white/70 text-sm outline-none placeholder:text-white/25 focus:border-[rgba(212,68,122,0.4)]" />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 h-9 rounded-xl text-[11px] font-medium capitalize transition-all"
              style={statusFilter === s
                ? { background: 'rgba(212,68,122,0.2)', border: '1px solid rgba(212,68,122,0.4)', color: '#D4447A' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        <button onClick={fetchBookings}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05] hover:bg-white/10 transition-all">
          <RefreshCw size={14} />
        </button>
        <span className="text-white/30 text-sm">{bookings.length} total</span>
      </div>

      <AdminTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No bookings found"
        onRowClick={openDetail}
      />

      {/* Detail / Edit Modal */}
      <AdminModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedBooking(null); }}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-5">
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.15)' }}>
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-2">Customer</p>
                <p className="text-white font-medium">{selectedBooking.name}</p>
                <p className="text-white/50 text-sm mt-1">{selectedBooking.phone}</p>
                <p className="text-white/40 text-sm">{selectedBooking.email}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.15)' }}>
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-2">Current Status</p>
                <StatusBadge status={selectedBooking.status} />
                <p className="text-white/30 text-xs mt-2">
                  {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString('en-IN') : '—'}
                </p>
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-3">Services Requested</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedBooking.services?.map((svc, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-white/80 text-sm">{svc.name}</p>
                      <p className="text-white/30 text-xs">{svc.category} • {svc.duration}</p>
                    </div>
                    <span className="text-[#D4447A] text-sm">{svc.member}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-3">Schedule Appointment</p>
              <div className="grid grid-cols-2 gap-4">
                <AdminInput label="Date" type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} />
                <AdminInput label="Time" type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
              </div>
            </div>

            <AdminTextarea label="Internal Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for this booking..." />

            {/* Status actions */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(['confirmed', 'completed', 'cancelled', 'rescheduled'] as const).map(status => (
                  <button key={status} onClick={() => updateBooking(selectedBooking.id, {
                    status,
                    scheduledDate: schedDate || undefined,
                    scheduledTime: schedTime || undefined,
                    notes,
                  })}
                    disabled={updating || selectedBooking.status === status}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: selectedBooking.status === status ? 'rgba(212,68,122,0.2)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${selectedBooking.status === status ? 'rgba(212,68,122,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: selectedBooking.status === status ? '#D4447A' : 'rgba(255,255,255,0.5)',
                    }}
                  >{status}</button>
                ))}
              </div>
            </div>

            {/* Save schedule only */}
            <button onClick={() => updateBooking(selectedBooking.id, {
              scheduledDate: schedDate || undefined,
              scheduledTime: schedTime || undefined,
              notes,
            })}
              disabled={updating}
              className="w-full h-10 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
              {updating ? 'Saving...' : 'Save Schedule & Notes'}
            </button>

            <button onClick={() => deleteBooking(selectedBooking.id)}
              className="w-full h-9 rounded-xl text-red-400 text-sm border border-red-500/20 hover:bg-red-500/10 transition-all">
              Delete Booking
            </button>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
