'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, RefreshCw, Printer, Trash2, FileDown, Receipt, Sparkles } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Bill, BillItem } from '@/types/admin';
import { serviceCategories } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import { getAllAddons } from '@/lib/api/service-addons';
import type { ServiceAddon } from '@/types/database.types';

const PAYMENT_OPTS = [
  { value: 'cash',  label: 'Cash'  },
  { value: 'card',  label: 'Card'  },
  { value: 'upi',   label: 'UPI'   },
  { value: 'other', label: 'Other' },
];

const EMPTY_ITEM: Partial<BillItem> = { name: '', type: 'service', quantity: 1, unitPrice: 0, discount: 0 };

function InvoicePrintContent({ bill, salonName = 'Lakshana Premier Beauty Salon' }: { bill: Bill; salonName?: string }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#2D1B25', padding: '32px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #D4447A', paddingBottom: '20px', marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 300, color: '#D4447A', letterSpacing: '0.05em' }}>{salonName}</h1>
        <p style={{ margin: '6px 0 0', color: '#7B4F62', fontSize: '13px' }}>Nolambur, Chennai, Tamil Nadu</p>
      </div>

      {/* Invoice meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 300, color: '#2D1B25' }}>INVOICE</p>
          <p style={{ margin: '4px 0 0', color: '#B89BAA', fontSize: '13px' }}>#{bill.invoiceNumber}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#B89BAA', fontSize: '13px' }}>
            {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ margin: '4px 0 0', color: '#B89BAA', fontSize: '12px', textTransform: 'capitalize' }}>
            Payment: {bill.paymentMethod}
          </p>
        </div>
      </div>

      {/* Bill to */}
      <div style={{ background: '#FFF0F5', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#D4447A', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Bill To</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#2D1B25' }}>{bill.customerName}</p>
        <p style={{ margin: '2px 0 0', color: '#7B4F62', fontSize: '13px' }}>{bill.customerPhone}</p>
        {bill.customerEmail && <p style={{ margin: '2px 0 0', color: '#7B4F62', fontSize: '13px' }}>{bill.customerEmail}</p>}
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#D4447A', color: 'white' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 400, letterSpacing: '0.1em' }}>Service / Product</th>
            <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 400 }}>Qty</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400 }}>Unit Price</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400 }}>Discount</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #FCE4EC', background: i % 2 ? '#FFF8FC' : '#fff' }}>
              <td style={{ padding: '10px 14px', color: '#2D1B25' }}>{item.name}</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', color: '#7B4F62' }}>{item.quantity}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#2D1B25' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#22C55E' }}>{item.discount ? `-₹${item.discount}` : '—'}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#2D1B25' }}>₹{item.total.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
        <div style={{ width: '220px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7B4F62', borderBottom: '1px solid #FCE4EC' }}>
            <span>Subtotal</span><span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {bill.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#22C55E', borderBottom: '1px solid #FCE4EC' }}>
              <span>Discount</span><span>-₹{bill.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          {bill.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7B4F62', borderBottom: '1px solid #FCE4EC' }}>
              <span>Tax</span><span>₹{bill.tax.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#D4447A', fontWeight: 700, fontSize: '18px', borderTop: '2px solid #D4447A', marginTop: '4px' }}>
            <span>TOTAL</span><span>₹{bill.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {bill.notes && (
        <div style={{ padding: '12px 16px', background: '#FFF0F5', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#7B4F62', fontSize: '13px' }}><strong>Note:</strong> {bill.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #FCE4EC', paddingTop: '20px' }}>
        <p style={{ margin: 0, color: '#D4447A', fontSize: '15px' }}>Thank you for choosing {salonName}! 💄</p>
        <p style={{ margin: '6px 0 0', color: '#B89BAA', fontSize: '12px' }}>
          Visit us again soon • Nolambur, Chennai
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [bills, setBills]       = useState<Bill[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [printBill, setPrintBill]   = useState<Bill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    discount: 0, tax: 0, paymentMethod: 'cash', notes: '',
  });
  const [items, setItems] = useState<Partial<BillItem>[]>([{ ...EMPTY_ITEM }]);

  // Load add-ons
  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      const data = await getAllAddons(true); // activeOnly = true
      setAddons(data);
    } catch (error) {
      console.error('Error loading add-ons:', error);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const fetchBills = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/billing?search=${encodeURIComponent(search)}&limit=50`);
    const data = await res.json();
    if (data.success) setBills(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBills, 300);
    return () => clearTimeout(t);
  }, [fetchBills]);

  const addItem = () => setItems(p => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: unknown) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((s, i) => s + ((i.unitPrice || 0) * (i.quantity || 1)) - (i.discount || 0), 0);
  const addonsTotal = selectedAddons.reduce((s, id) => {
    const addon = addons.find(a => a.id === id);
    return s + (addon?.price || 0);
  }, 0);
  const total    = subtotal + addonsTotal - (form.discount || 0) + (form.tax || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items[0]?.name) { toast({ title: 'Add at least one service or item', variant: 'destructive' }); return; }
    setSubmitting(true);
    
    // Include selected add-ons as items
    const addonItems = selectedAddons.map(id => {
      const addon = addons.find(a => a.id === id);
      return {
        name: addon?.name || 'Add-on',
        type: 'service' as const,
        quantity: 1,
        unitPrice: addon?.price || 0,
        discount: 0,
        total: addon?.price || 0,
      };
    });
    
    const allItems = [...items, ...addonItems];
    
    const res = await fetch('/api/admin/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items: allItems }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: `✅ Bill created! Invoice: ${data.invoiceNumber}` });
      setCreateOpen(false);
      setItems([{ ...EMPTY_ITEM }]);
      setSelectedAddons([]);
      setForm({ customerName:'', customerPhone:'', customerEmail:'', discount:0, tax:0, paymentMethod:'cash', notes:'' });
      fetchBills();
    } else {
      toast({ title: data.error || 'Failed to create bill', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handlePrint = (bill: Bill) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => setPrintBill(null), 1000);
    }, 500);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export?type=billing');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lakshana-billing-${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast({ title: 'Billing report exported!' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    setExporting(false);
  };

  // Revenue summary
  const totalRevenue = bills.reduce((s, b) => s + (b.total || 0), 0);
  const paidBills    = bills.filter(b => b.status === 'paid').length;

  const columns = [
    {
      key: 'invoiceNumber' as keyof Bill,
      label: 'Invoice',
      render: (b: Bill) => <span className="text-[#D4447A] text-sm font-mono font-bold">#{b.invoiceNumber}</span>,
    },
    {
      key: 'customerName' as keyof Bill,
      label: 'Customer',
      render: (b: Bill) => (
        <div>
          <p className="text-white text-sm font-medium">{b.customerName}</p>
          <p className="text-white/35 text-[11px]">{b.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'items' as keyof Bill,
      label: 'Services',
      render: (b: Bill) => (
        <div>
          <p className="text-white/60 text-sm">{b.items?.[0]?.name || '—'}</p>
          {(b.items?.length ?? 0) > 1 && <p className="text-white/25 text-[11px]">+{(b.items?.length ?? 0) - 1} more</p>}
        </div>
      ),
    },
    {
      key: 'total' as keyof Bill,
      label: 'Amount',
      render: (b: Bill) => <span className="text-white font-semibold text-sm">₹{(b.total || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'paymentMethod' as keyof Bill,
      label: 'Payment',
      render: (b: Bill) => <span className="text-white/40 text-sm capitalize">{b.paymentMethod}</span>,
    },
    {
      key: 'status' as keyof Bill,
      label: 'Status',
      render: (b: Bill) => <StatusBadge status={b.status} />,
    },
    {
      key: 'createdAt' as keyof Bill,
      label: 'Date',
      render: (b: Bill) => (
        <span className="text-white/30 text-[11px]">
          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
        </span>
      ),
    },
    {
      key: 'id' as keyof Bill,
      label: 'Print',
      render: (b: Bill) => (
        <button onClick={e => { e.stopPropagation(); handlePrint(b); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-[#D4447A] hover:bg-[rgba(212,68,122,0.1)] transition-all">
          <Printer size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bills',    value: bills.length,               color: '#D4447A' },
          { label: 'Paid',           value: paidBills,                  color: '#22C55E' },
          { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#D4AF37' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }}>
            <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
            <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice, customer, phone..."
            className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 text-white/70 text-sm outline-none placeholder:text-white/25 focus:border-[rgba(212,68,122,0.4)]" />
        </div>
        <button onClick={fetchBills}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
          <RefreshCw size={14} />
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="h-10 px-4 rounded-xl flex items-center gap-2 text-[#D4447A] text-sm border border-[rgba(212,68,122,0.3)] hover:bg-[rgba(212,68,122,0.1)] transition-all disabled:opacity-50">
          <FileDown size={14} /> {exporting ? 'Exporting...' : 'Export'}
        </button>
        <button onClick={() => setCreateOpen(true)}
          className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.3)' }}>
          <Plus size={14} /> Create Bill
        </button>
      </div>

      <AdminTable columns={columns} data={bills} loading={loading} emptyMessage="No bills created yet" />

      {/* Create Bill Modal */}
      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Bill" size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer */}
          <div className="grid grid-cols-3 gap-4">
            <AdminInput label="Customer Name *" value={form.customerName}
              onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} required placeholder="Full name" />
            <AdminInput label="Phone *" type="tel" value={form.customerPhone}
              onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} required placeholder="+91..." />
            <AdminInput label="Email (optional)" type="email" value={form.customerEmail}
              onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))} placeholder="For invoice email" />
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Services / Products</p>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-[#D4447A] text-xs hover:text-white transition-colors">
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  {/* Service picker */}
                  <div className="col-span-5">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Service / Product</p>}
                    <select value={item.name} onChange={e => {
                      const name = e.target.value;
                      const allSvcs = serviceCategories.flatMap(c => c.services);
                      const svc = allSvcs.find(s => s.name === name);
                      updateItem(i, 'name', name);
                      if (svc) {
                        const price = parseFloat(svc.member.replace(/[^0-9.]/g, '')) || 0;
                        updateItem(i, 'unitPrice', price);
                        updateItem(i, 'type', 'service');
                      }
                    }}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 outline-none"
                      style={{ background: '#1A1025' }}>
                      <option value="">— Select —</option>
                      {serviceCategories.map(cat => (
                        <optgroup key={cat.id} label={cat.title} style={{ background: '#1A1025' }}>
                          {cat.services.map(s => (
                            <option key={s.name} value={s.name} style={{ background: '#1A1025' }}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Custom" style={{ background: '#1A1025' }}>
                        <option value="__custom" style={{ background: '#1A1025' }}>Custom item…</option>
                      </optgroup>
                    </select>
                    {item.name === '__custom' && (
                      <input placeholder="Item name" onChange={e => updateItem(i, 'name', e.target.value)}
                        className="w-full h-9 mt-1 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                    )}
                  </div>
                  {/* Qty */}
                  <div className="col-span-1">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Qty</p>}
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', +e.target.value)}
                      className="w-full h-10 rounded-xl px-2 text-sm text-white text-center border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Price */}
                  <div className="col-span-2">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Price (₹)</p>}
                    <input type="number" min="0" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', +e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Discount */}
                  <div className="col-span-2">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Disc (₹)</p>}
                    <input type="number" min="0" value={item.discount}
                      onChange={e => updateItem(i, 'discount', +e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Total */}
                  <div className="col-span-2 flex items-center justify-between">
                    {i === 0 && <div />}
                    <span className="text-[#D4447A] text-sm font-semibold">
                      ₹{((item.unitPrice || 0) * (item.quantity || 1) - (item.discount || 0)).toLocaleString('en-IN')}
                    </span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons section */}
          {addons.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#D4447A]" />
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Add-ons</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {addons.map(addon => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`
                        p-3 rounded-xl border transition-all text-left
                        ${isSelected 
                          ? 'bg-[rgba(212,68,122,0.15)] border-[#D4447A] ring-2 ring-[rgba(212,68,122,0.3)]' 
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`text-sm font-medium ${isSelected ? 'text-[#D4447A]' : 'text-white/80'}`}>
                          {addon.name}
                        </p>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D4447A] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mb-2 line-clamp-2">{addon.description}</p>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-[#D4447A]' : 'text-white/60'}`}>
                        +₹{addon.price.toLocaleString('en-IN')}
                      </p>
                    </button>
                  );
                })}
              </div>
              {selectedAddons.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[rgba(212,68,122,0.08)] border border-[rgba(212,68,122,0.2)]">
                  <p className="text-xs text-white/60 mb-2">Selected Add-ons:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAddons.map(id => {
                      const addon = addons.find(a => a.id === id);
                      return addon ? (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D4447A]/20 text-[#D4447A] text-xs">
                          {addon.name} • ₹{addon.price}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discount / Tax / Payment */}
          <div className="grid grid-cols-3 gap-4">
            <AdminInput label="Overall Discount (₹)" type="number" min="0"
              value={String(form.discount)} onChange={e => setForm(p => ({ ...p, discount: +e.target.value }))} />
            <AdminInput label="Tax (₹)" type="number" min="0"
              value={String(form.tax)} onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} />
            <AdminSelect label="Payment Method" value={form.paymentMethod}
              onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} options={PAYMENT_OPTS} />
          </div>

          {/* Total summary */}
          <div className="flex justify-end">
            <div className="rounded-xl p-4 w-56"
              style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.2)' }}>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-white/40"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Add-ons ({selectedAddons.length})</span>
                    <span>₹{addonsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {form.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{form.discount}</span></div>}
                {form.tax > 0 && <div className="flex justify-between text-white/40"><span>Tax</span><span>₹{form.tax}</span></div>}
                <div className="flex justify-between text-[#D4447A] font-bold text-lg pt-2" style={{ borderTop: '1px solid rgba(212,68,122,0.2)' }}>
                  <span>TOTAL</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <AdminTextarea label="Notes (optional)" value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes for this bill..." />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
              <Receipt size={14} />
              {submitting ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Print invoice (hidden, shows on window.print()) */}
      {printBill && (
        <div className="print:block hidden fixed inset-0 z-[200] bg-white overflow-auto">
          <InvoicePrintContent bill={printBill} />
        </div>
      )}
    </div>
  );
}
