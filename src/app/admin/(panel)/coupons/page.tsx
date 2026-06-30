'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Coupon } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const DISCOUNT_OPTS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'flat', label: 'Flat Amount (₹)' },
];

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxUses: '', expiresAt: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    const data = await res.json();
    if (data.success) setCoupons(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: 'Coupon created!' });
      setOpen(false);
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
      fetchCoupons();
    } else {
      toast({ title: 'Error', description: data.error, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const toggleActive = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    toast({ title: 'Coupon deleted' });
    fetchCoupons();
  };

  const columns = [
    {
      key: 'code' as keyof Coupon,
      label: 'Code',
      render: (c: Coupon) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,68,122,0.15)' }}>
            <Tag size={13} className="text-[#D4447A]" />
          </div>
          <span className="text-[#D4447A] text-sm font-mono font-bold">{c.code}</span>
        </div>
      ),
    },
    {
      key: 'discountValue' as keyof Coupon,
      label: 'Discount',
      render: (c: Coupon) => (
        <span className="text-white font-medium text-sm">
          {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
        </span>
      ),
    },
    {
      key: 'usedCount' as keyof Coupon,
      label: 'Used',
      render: (c: Coupon) => (
        <span className="text-white/50 text-sm">
          {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ''}
        </span>
      ),
    },
    {
      key: 'expiresAt' as keyof Coupon,
      label: 'Expires',
      render: (c: Coupon) => (
        <span className="text-white/40 text-sm">
          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}
        </span>
      ),
    },
    {
      key: 'isActive' as keyof Coupon,
      label: 'Status',
      render: (c: Coupon) => <StatusBadge status={c.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'id' as keyof Coupon,
      label: 'Actions',
      render: (c: Coupon) => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => toggleActive(c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            {c.isActive ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => deleteCoupon(c.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)}
          className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      <AdminTable columns={columns} data={coupons} loading={loading} emptyMessage="No coupons created yet" />

      <AdminModal open={open} onClose={() => setOpen(false)} title="Create Coupon" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput label="Coupon Code" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required placeholder="e.g. FESTIVE20" hint="Will be auto-uppercased" />
          <AdminTextarea label="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this coupon for?" />
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect label="Discount Type" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))} options={DISCOUNT_OPTS} />
            <AdminInput label={`Value (${form.discountType === 'percentage' ? '%' : '₹'})`} type="number" min="0" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} required placeholder="20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Min Order (₹)" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} placeholder="Optional" />
            <AdminInput label="Max Uses" type="number" min="0" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="Unlimited" />
          </div>
          <AdminInput label="Expiry Date (optional)" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
