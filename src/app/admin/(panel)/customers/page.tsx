'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, RefreshCw, Phone, Mail, Edit2, Trash2, Crown, FileDown, ChevronRight } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Customer } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const LOYALTY_COLORS: Record<string, string> = {
  Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#D4AF37', Platinum: '#E5E4E2',
};

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers]         = useState<Customer[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [createOpen, setCreateOpen]       = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailOpen, setDetailOpen]       = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [exporting, setExporting]         = useState(false);
  const [existingWarning, setExistingWarning] = useState('');

  const emptyForm = {
    name: '', phone: '', email: '', address: '',
    dateOfBirth: '', anniversary: '', notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}&limit=100`);
    const data = await res.json();
    if (data.success) setCustomers(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  // Check for existing customer by phone as user types
  const checkExisting = async (phone: string) => {
    if (phone.length < 10) { setExistingWarning(''); return; }
    const res = await fetch(`/api/admin/customers?search=${phone}&limit=1`);
    const data = await res.json();
    if (data.success && data.data.length > 0 && data.data[0].phone === phone) {
      setExistingWarning(`Existing customer: ${data.data[0].name} (${data.data[0].totalVisits} visits, ₹${data.data[0].totalSpent?.toLocaleString('en-IN')} spent)`);
    } else {
      setExistingWarning('');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: 'Customer created successfully!' });
      setCreateOpen(false);
      setForm(emptyForm);
      setExistingWarning('');
      fetchCustomers();
    } else if (res.status === 409) {
      toast({ title: 'Customer with this phone already exists', variant: 'destructive' });
    } else {
      toast({ title: data.error || 'Failed to create', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast({ title: 'Customer updated!' });
      setEditMode(false);
      fetchDetail(selectedCustomer.id);
      fetchCustomers();
    } else {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer and all their data?')) return;
    const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Customer deleted' });
      setDetailOpen(false);
      fetchCustomers();
    }
  };

  const fetchDetail = async (id: string) => {
    const res = await fetch(`/api/admin/customers/${id}`);
    const data = await res.json();
    if (data.success) {
      setSelectedCustomer(data.data);
      setDetailOpen(true);
      setEditMode(false);
    }
  };

  const startEdit = () => {
    setForm({
      name: selectedCustomer.name || '',
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
      address: selectedCustomer.address || '',
      dateOfBirth: selectedCustomer.dateOfBirth || '',
      anniversary: selectedCustomer.anniversary || '',
      notes: selectedCustomer.notes || '',
    });
    setEditMode(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export?type=customers');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lakshana-customers-${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Customer list exported!' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    setExporting(false);
  };

  const columns = [
    {
      key: 'name' as keyof Customer,
      label: 'Customer',
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${LOYALTY_COLORS[c.loyaltyStatus] || '#d4af37'}, #b8941f)` }}>
            {c.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{c.name}</p>
            <p className="text-white/40 text-[11px] flex items-center gap-1">
              <Phone size={9} /> {c.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email' as keyof Customer,
      label: 'Email',
      render: (c: Customer) => (
        <span className="text-white/50 text-sm">
          {c.email
            ? <span className="flex items-center gap-1.5"><Mail size={11} className="text-[#d4af37] shrink-0" />{c.email}</span>
            : <span className="text-white/20">—</span>}
        </span>
      ),
    },
    {
      key: 'totalVisits' as keyof Customer,
      label: 'Visits',
      render: (c: Customer) => (
        <span className="text-white/60 text-sm">{c.totalVisits ?? 0}</span>
      ),
    },
    {
      key: 'totalSpent' as keyof Customer,
      label: 'Total Spent',
      render: (c: Customer) => (
        <span className="text-[#d4af37] text-sm font-medium">
          ₹{(c.totalSpent ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'loyaltyStatus' as keyof Customer,
      label: 'Loyalty',
      render: (c: Customer) => <StatusBadge status={c.loyaltyStatus || 'Bronze'} />,
    },
    {
      key: 'lastVisit' as keyof Customer,
      label: 'Last Visit',
      render: (c: Customer) => (
        <span className="text-white/30 text-[11px]">
          {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Loyalty summary */}
      <div className="grid grid-cols-4 gap-3">
        {['Bronze', 'Silver', 'Gold', 'Platinum'].map(tier => {
          const count = customers.filter(c => c.loyaltyStatus === tier).length;
          return (
            <div key={tier} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${LOYALTY_COLORS[tier]}22` }}>
              <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: LOYALTY_COLORS[tier] }}>
                {count}
              </p>
              <p className="text-[9px] uppercase tracking-[0.3em] mt-1" style={{ color: LOYALTY_COLORS[tier], opacity: 0.7 }}>
                {tier}
              </p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 text-white/70 text-sm outline-none placeholder:text-white/25 focus:border-[rgba(212,175,55,0.4)]" />
        </div>
        <button onClick={fetchCustomers}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05] transition-all">
          <RefreshCw size={14} />
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="h-10 px-4 rounded-xl flex items-center gap-2 text-[#d4af37] text-sm border border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.1)] transition-all disabled:opacity-50">
          <FileDown size={14} /> {exporting ? 'Exporting...' : 'Export'}
        </button>
        <button onClick={() => { setForm(emptyForm); setExistingWarning(''); setCreateOpen(true); }}
          className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
          <Plus size={14} /> Add Customer
        </button>
        <span className="text-white/30 text-sm">{customers.length} total</span>
      </div>

      <AdminTable columns={columns} data={customers} loading={loading}
        emptyMessage="No customers found. Add your first customer!"
        onRowClick={c => fetchDetail(c.id)} />

      {/* Create Modal */}
      <AdminModal open={createOpen} onClose={() => { setCreateOpen(false); setExistingWarning(''); }} title="Add New Customer" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {existingWarning && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Crown size={14} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs leading-relaxed">{existingWarning}</p>
            </motion.div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Customer full name" />
            <AdminInput label="Phone *" type="tel" value={form.phone}
              onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); checkExisting(e.target.value); }}
              required placeholder="+91 XXXXX XXXXX" />
          </div>
          <AdminInput label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="customer@email.com" />
          <AdminInput label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
            <AdminInput label="Anniversary" type="date" value={form.anniversary} onChange={e => setForm(p => ({ ...p, anniversary: e.target.value }))} />
          </div>
          <AdminTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes about this customer..." />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setCreateOpen(false); setExistingWarning(''); }}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
              {submitting ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Detail / Edit Modal */}
      <AdminModal open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedCustomer(null); setEditMode(false); }}
        title={editMode ? 'Edit Customer' : 'Customer Profile'} size="xl">
        {selectedCustomer && !editMode && (
          <div className="space-y-5">
            {/* Profile header */}
            <div className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${LOYALTY_COLORS[selectedCustomer.loyaltyStatus] || '#d4af37'}, #b8941f)`, boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
                {selectedCustomer.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-white text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {selectedCustomer.name}
                  </h3>
                  <StatusBadge status={selectedCustomer.loyaltyStatus || 'Bronze'} />
                </div>
                <p className="text-white/50 text-sm mt-1">{selectedCustomer.phone}</p>
                {selectedCustomer.email && <p className="text-white/40 text-sm">{selectedCustomer.email}</p>}
              </div>
              <div className="text-right">
                <p className="text-[#d4af37] text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-white/30 text-xs">{selectedCustomer.totalVisits || 0} visits</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Visits',  value: selectedCustomer.totalVisits || 0 },
                { label: 'Total Spent',   value: `₹${(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}` },
                { label: 'Last Visit',    value: selectedCustomer.lastVisit ? new Date(selectedCustomer.lastVisit).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Never' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-white text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
                  <p className="text-white/25 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Extra info */}
            {(selectedCustomer.address || selectedCustomer.dateOfBirth || selectedCustomer.anniversary || selectedCustomer.notes) && (
              <div className="grid grid-cols-2 gap-3">
                {selectedCustomer.address && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mb-1">Address</p>
                    <p className="text-white/60 text-sm">{selectedCustomer.address}</p>
                  </div>
                )}
                {selectedCustomer.dateOfBirth && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mb-1">Birthday</p>
                    <p className="text-white/60 text-sm">{new Date(selectedCustomer.dateOfBirth + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="rounded-xl p-3 col-span-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mb-1">Notes</p>
                    <p className="text-white/60 text-sm leading-relaxed">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking history */}
            {selectedCustomer.bookings?.length > 0 && (
              <div>
                <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold mb-3">Recent Bookings</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedCustomer.bookings.slice(0, 5).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p className="text-white/60 text-sm">{b.services?.[0]?.name || 'Booking'}</p>
                        <p className="text-white/25 text-[11px]">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bill history */}
            {selectedCustomer.bills?.length > 0 && (
              <div>
                <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold mb-3">Billing History</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedCustomer.bills.slice(0, 5).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p className="text-white/60 text-sm font-mono">#{b.invoiceNumber}</p>
                        <p className="text-white/25 text-[11px]">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}</p>
                      </div>
                      <span className="text-[#d4af37] text-sm font-medium">₹{(b.total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={startEdit}
                className="flex-1 h-10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
                <Edit2 size={13} /> Edit Profile
              </button>
              <button onClick={() => handleDelete(selectedCustomer.id)}
                className="h-10 px-4 rounded-xl text-red-400 text-sm border border-red-500/20 hover:bg-red-500/10 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Edit mode */}
        {selectedCustomer && editMode && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput label="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <AdminInput label="Phone *" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
            </div>
            <AdminInput label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <AdminInput label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <AdminInput label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
              <AdminInput label="Anniversary" type="date" value={form.anniversary} onChange={e => setForm(p => ({ ...p, anniversary: e.target.value }))} />
            </div>
            <AdminTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditMode(false)}
                className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
