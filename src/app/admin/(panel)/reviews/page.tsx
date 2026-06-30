'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, Trash2, Crown, Plus, RefreshCw, MessageSquare, QrCode, Download, ExternalLink } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Review } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={12}
          className={i < rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/15'} />
      ))}
      <span className="text-white/30 text-xs ml-1">{rating}/{max}</span>
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button"
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110">
          <Star size={24}
            className={(hovered || value) > i ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/20'} />
        </button>
      ))}
    </div>
  );
}

const SOURCE_OPTS = [
  { value: 'website',   label: 'Website' },
  { value: 'google',    label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'qr_scan',   label: 'QR Code Scan' },
  { value: 'manual',    label: 'Manual Entry' },
];

export default function ReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [addOpen, setAddOpen]   = useState(false);
  const [qrOpen, setQrOpen]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', rating: 5,
    comment: '', service: '', source: 'manual',
  });

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reviews');
    const data = await res.json();
    if (data.success) setReviews(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  // Generate QR Code
  const generateQRCode = async () => {
    const reviewUrl = `${window.location.origin}/review`;
    try {
      const dataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#d4af37',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
      setQrOpen(true);
    } catch (err) {
      console.error('QR generation error:', err);
      toast({ title: 'Failed to generate QR code', variant: 'destructive' });
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'lakshana-review-qr-code.png';
    link.href = qrDataUrl;
    link.click();
  };

  const openReviewPage = () => {
    window.open('/review', '_blank');
  };

  const updateReview = async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
    if (res.ok) { toast({ title: 'Review updated' }); fetchReviews(); }
    else toast({ title: 'Update failed', variant: 'destructive' });
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    toast({ title: 'Review deleted' });
    fetchReviews();
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/admin/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: 'Review added!' });
      setAddOpen(false);
      setForm({ customerName:'', customerPhone:'', rating:5, comment:'', service:'', source:'manual' });
      fetchReviews();
    } else { toast({ title: data.error || 'Failed', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const columns = [
    {
      key: 'customerName' as keyof Review,
      label: 'Customer',
      render: (r: Review) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
            {r.customerName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{r.customerName}</p>
            {r.customerPhone && <p className="text-white/30 text-[11px]">{r.customerPhone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'rating' as keyof Review,
      label: 'Rating',
      render: (r: Review) => <StarRating rating={r.rating} />,
    },
    {
      key: 'comment' as keyof Review,
      label: 'Review',
      render: (r: Review) => (
        <p className="text-white/55 text-sm max-w-xs line-clamp-2 leading-relaxed">{r.comment}</p>
      ),
    },
    {
      key: 'service' as keyof Review,
      label: 'Service',
      render: (r: Review) => <span className="text-white/35 text-xs">{r.service || '—'}</span>,
    },
    {
      key: 'status' as keyof Review,
      label: 'Status',
      render: (r: Review) => <StatusBadge status={r.status} />,
    },
    {
      key: 'isFeatured' as keyof Review,
      label: 'Featured',
      render: (r: Review) => (
        r.isFeatured
          ? <span className="text-[#D4AF37] text-[10px] font-bold flex items-center gap-1"><Crown size={10} />Yes</span>
          : <span className="text-white/15 text-xs">—</span>
      ),
    },
    {
      key: 'id' as keyof Review,
      label: 'Actions',
      render: (r: Review) => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {r.status !== 'approved' && (
            <button onClick={() => updateReview(r.id, { status: 'approved' })} title="Approve"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-green-400/60 hover:text-green-400 hover:bg-green-400/10">
              <Check size={13} />
            </button>
          )}
          {r.status !== 'rejected' && (
            <button onClick={() => updateReview(r.id, { status: 'rejected' })} title="Reject"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-red-400/60 hover:text-red-400 hover:bg-red-400/10">
              <X size={13} />
            </button>
          )}
          <button onClick={() => updateReview(r.id, { isFeatured: !r.isFeatured })} title="Toggle featured"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/10">
            <Crown size={13} />
          </button>
          <button onClick={() => deleteReview(r.id)} title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-red-400/40 hover:text-red-400 hover:bg-red-400/10">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews',  value: reviews.length,                                         color: '#d4af37' },
          { label: 'Pending',        value: reviews.filter(r => r.status === 'pending').length,     color: '#EAB308' },
          { label: 'Approved',       value: reviews.filter(r => r.status === 'approved').length,    color: '#22C55E' },
          { label: 'Avg Rating',     value: `${avgRating} ⭐`,                                       color: '#D4AF37' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }}>
            <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
            <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 h-9 rounded-xl text-xs font-medium capitalize transition-all"
              style={filter === f
                ? { background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }>
              {f === 'all' ? 'All' : f}
              <span className="ml-1.5 opacity-50">
                ({f === 'all' ? reviews.length : reviews.filter(r => r.status === f).length})
              </span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={fetchReviews}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
            <RefreshCw size={13} />
          </button>
          <button onClick={generateQRCode}
            className="h-9 px-4 rounded-xl flex items-center gap-2 text-white text-xs font-medium border border-[#d4af37]/30 hover:bg-[#d4af37]/10 transition-all">
            <QrCode size={14} /> QR Code
          </button>
          <button onClick={() => setAddOpen(true)}
            className="h-9 px-4 rounded-xl flex items-center gap-2 text-white text-xs font-medium"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
            <Plus size={13} /> Add Review
          </button>
        </div>
      </div>

      <AdminTable columns={columns} data={filtered} loading={loading} emptyMessage="No reviews found" />

      {/* Add Review Modal */}
      <AdminModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Review Manually" size="md">
        <form onSubmit={handleAddReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Customer Name *" value={form.customerName}
              onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} required placeholder="Full name" />
            <AdminInput label="Phone (optional)" value={form.customerPhone}
              onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} placeholder="+91..." />
          </div>

          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#d4af37]">Rating</p>
            <InteractiveStars value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>

          <AdminTextarea label="Review Comment *" value={form.comment}
            onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} required
            placeholder="Customer's review text..." />
          <AdminInput label="Service (optional)" value={form.service}
            onChange={e => setForm(p => ({ ...p, service: e.target.value }))} placeholder="e.g. Bridal Makeup" />
          <AdminSelect label="Source" value={form.source}
            onChange={e => setForm(p => ({ ...p, source: e.target.value }))} options={SOURCE_OPTS} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
              {submitting ? 'Adding...' : 'Add Review'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* QR Code Modal */}
      <AdminModal open={qrOpen} onClose={() => setQrOpen(false)} title="Customer Review QR Code" size="md">
        <div className="space-y-6">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              Customers can scan this QR code to leave a review directly. The review will appear in the pending section for your approval.
            </p>
          </div>

          {qrDataUrl && (
            <div className="flex justify-center">
              <div className="rounded-2xl p-6 inline-block"
                style={{ background: 'white', border: '2px solid #d4af37' }}>
                <img src={qrDataUrl} alt="Review QR Code" className="w-64 h-64" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openReviewPage}
              className="h-11 rounded-xl flex items-center justify-center gap-2 text-white/70 text-sm border border-white/10 hover:bg-white/5 transition-all">
              <ExternalLink size={14} /> Preview Page
            </button>
            <button
              onClick={downloadQR}
              className="h-11 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
              <Download size={14} /> Download QR
            </button>
          </div>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-bold mb-2">💡 Tips</p>
            <ul className="text-white/50 text-xs space-y-1.5 leading-relaxed">
              <li>• Print and display the QR code at your reception or checkout counter</li>
              <li>• Add it to your service receipts or thank-you cards</li>
              <li>• Share the review page link: <code className="text-[#d4af37] text-[10px]">{typeof window !== 'undefined' ? `${window.location.origin}/review` : '/review'}</code></li>
              <li>• All submissions require your approval before appearing on the website</li>
            </ul>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
