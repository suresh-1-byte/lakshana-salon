'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Star, RefreshCw } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Service } from '@/types/admin';
import { serviceCategories } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_OPTIONS = serviceCategories.map(c => ({ value: c.id, label: c.title }));

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', categoryId: CATEGORY_OPTIONS[0].value,
    categoryName: CATEGORY_OPTIONS[0].label, duration: '', memberPrice: '', nonMemberPrice: '',
    isFeatured: false,
  });

  const fetchServices = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    if (data.success) setServices(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditService(null);
    setForm({ name: '', description: '', categoryId: CATEGORY_OPTIONS[0].value, categoryName: CATEGORY_OPTIONS[0].label, duration: '', memberPrice: '', nonMemberPrice: '', isFeatured: false });
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditService(s);
    setForm({
      name: s.name, description: s.description, categoryId: s.categoryId,
      categoryName: s.categoryName, duration: s.duration,
      memberPrice: String(s.memberPrice), nonMemberPrice: String(s.nonMemberPrice),
      isFeatured: s.isFeatured,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const catName = serviceCategories.find(c => c.id === form.categoryId)?.title || form.categoryName;
    const payload = { ...form, categoryName: catName };

    const url = editService ? `/api/admin/services/${editService.id}` : '/api/admin/services';
    const method = editService ? 'PATCH' : 'POST';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: editService ? 'Service updated' : 'Service created' });
      setOpen(false);
      fetchServices();
    } else {
      toast({ title: 'Error', description: data.error, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    fetchServices();
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    toast({ title: 'Service deleted' });
    fetchServices();
  };

  const columns = [
    {
      key: 'name' as keyof Service,
      label: 'Service',
      render: (s: Service) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium">{s.name}</p>
            {s.isFeatured && <Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" />}
          </div>
          <p className="text-white/30 text-[11px] mt-0.5 line-clamp-1">{s.description}</p>
        </div>
      ),
    },
    { key: 'categoryName' as keyof Service, label: 'Category', render: (s: Service) => <span className="text-white/50 text-sm">{s.categoryName}</span> },
    { key: 'duration' as keyof Service, label: 'Duration', render: (s: Service) => <span className="text-white/50 text-sm">{s.duration}</span> },
    {
      key: 'memberPrice' as keyof Service,
      label: 'Member Price',
      render: (s: Service) => <span className="text-[#D4447A] text-sm font-medium">₹{s.memberPrice}</span>,
    },
    {
      key: 'nonMemberPrice' as keyof Service,
      label: 'Regular Price',
      render: (s: Service) => <span className="text-white/40 text-sm line-through">₹{s.nonMemberPrice}</span>,
    },
    {
      key: 'isActive' as keyof Service,
      label: 'Status',
      render: (s: Service) => <StatusBadge status={s.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'id' as keyof Service,
      label: 'Actions',
      render: (s: Service) => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(s)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-[#D4447A] hover:bg-[rgba(212,68,122,0.1)] transition-all">
            <Edit2 size={12} />
          </button>
          <button onClick={() => toggleActive(s)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            {s.isActive ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => deleteService(s.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-white/30 text-sm">{services.length} services</span>
        <div className="flex gap-3">
          <button onClick={fetchServices}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
            <RefreshCw size={14} />
          </button>
          <button onClick={openCreate}
            className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
            <Plus size={14} /> Add Service
          </button>
        </div>
      </div>

      <AdminTable columns={columns} data={services} loading={loading} emptyMessage="No services found" />

      <AdminModal open={open} onClose={() => setOpen(false)} title={editService ? 'Edit Service' : 'Add Service'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput label="Service Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Service name" />
          <AdminTextarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
          <AdminSelect
            label="Category"
            value={form.categoryId}
            onChange={e => {
              const cat = serviceCategories.find(c => c.id === e.target.value);
              setForm(p => ({ ...p, categoryId: e.target.value, categoryName: cat?.title || '' }));
            }}
            options={CATEGORY_OPTIONS}
          />
          <AdminInput label="Duration" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} required placeholder="e.g. 45 min" />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Member Price (₹)" type="number" min="0" value={form.memberPrice} onChange={e => setForm(p => ({ ...p, memberPrice: e.target.value }))} placeholder="0" />
            <AdminInput label="Regular Price (₹)" type="number" min="0" value={form.nonMemberPrice} onChange={e => setForm(p => ({ ...p, nonMemberPrice: e.target.value }))} placeholder="0" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 rounded accent-[#D4447A]" />
            <span className="text-white/60 text-sm">Mark as featured service</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
              {submitting ? 'Saving...' : editService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
