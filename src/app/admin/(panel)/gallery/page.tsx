'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Star, StarOff, Upload, X, RefreshCw, Grid3X3, List, Image as ImgIcon } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminSelect } from '@/components/admin/AdminInput';
import type { GalleryImage, GalleryCategory } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const CATEGORIES: GalleryCategory[] = ['Hair','Skin','Nails','Hair Spa','Bridal','Interiors','Other','Before/After'];
const CAT_OPTS = CATEGORIES.map(c => ({ value: c, label: c }));

export default function GalleryPage() {
  const { toast } = useToast();
  const [images, setImages]         = useState<GalleryImage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [addOpen, setAddOpen]       = useState(false);
  const [editImage, setEditImage]   = useState<GalleryImage | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  const [form, setForm] = useState({
    url: '', caption: '', category: 'Hair' as GalleryCategory, isFeatured: false,
  });

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const q = filter ? `?category=${encodeURIComponent(filter)}` : '';
    const res = await fetch(`/api/admin/gallery${q}`);
    const data = await res.json();
    if (data.success) setImages(data.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { toast({ title: 'Image URL required', variant: 'destructive' }); return; }
    setSubmitting(true);
    const res = await fetch('/api/admin/gallery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ title: 'Image added to gallery!' });
      setAddOpen(false);
      setForm({ url: '', caption: '', category: 'Hair', isFeatured: false });
      fetchImages();
    } else { toast({ title: data.error || 'Failed', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editImage) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/gallery/${editImage.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: form.caption, category: form.category, isFeatured: form.isFeatured }),
    });
    if (res.ok) {
      toast({ title: 'Image updated!' });
      setEditImage(null);
      fetchImages();
    } else { toast({ title: 'Update failed', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image from the gallery?')) return;
    setDeleting(id);
    await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    toast({ title: 'Image deleted' });
    setDeleting(null);
    fetchImages();
  };

  const toggleFeatured = async (img: GalleryImage) => {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !img.isFeatured }),
    });
    fetchImages();
  };

  const openEdit = (img: GalleryImage) => {
    setEditImage(img);
    setForm({ url: img.url, caption: img.caption || '', category: img.category, isFeatured: img.isFeatured });
  };

  // Drag-and-drop URL paste
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const url = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('URL');
    if (url) { setForm(p => ({ ...p, url })); setAddOpen(true); }
  };

  const featured = images.filter(i => i.isFeatured).length;
  const total    = images.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Images',    value: total,    color: '#d4af37' },
          { label: 'Featured',        value: featured, color: '#D4AF37' },
          { label: 'Categories',      value: CATEGORIES.filter(c => images.some(i => i.category === c)).length, color: '#818CF8' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }}>
            <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category filters */}
        <div className="flex gap-1.5 flex-wrap">
          {['', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-3 h-8 rounded-xl text-[11px] font-medium transition-all"
              style={filter === cat
                ? { background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }>
              {cat || 'All'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {([['grid', Grid3X3], ['list', List]] as const).map(([mode, Icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="w-9 h-9 flex items-center justify-center transition-all"
                style={viewMode === mode
                  ? { background: 'rgba(212,175,55,0.2)', color: '#d4af37' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }
                }>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <button onClick={fetchImages}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
            <RefreshCw size={13} />
          </button>
          <button onClick={() => setAddOpen(true)}
            className="h-9 px-4 rounded-xl flex items-center gap-2 text-white text-xs font-medium"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
            <Plus size={13} /> Add Image
          </button>
        </div>
      </div>

      {/* Drag-drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 py-4 transition-all duration-300 cursor-pointer"
        style={{
          borderColor: dragOver ? '#d4af37' : 'rgba(212,175,55,0.15)',
          background: dragOver ? 'rgba(212,175,55,0.06)' : 'transparent',
        }}
        onClick={() => setAddOpen(true)}
      >
        <Upload size={16} className="text-[#d4af37] opacity-60" />
        <p className="text-white/30 text-sm">
          {dragOver ? 'Drop image URL here' : 'Click to add image or drag & drop an image URL'}
        </p>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-white/25">
            <ImgIcon size={40} className="mx-auto mb-4 opacity-30" />
            <p>No images yet. Click "Add Image" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(212,175,55,0.1)' }}>
                  <Image src={img.url} alt={img.caption || 'Gallery'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="220px" unoptimized={img.url.startsWith('http')} />

                  {/* Category badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white"
                    style={{ background: 'rgba(212,175,55,0.85)', backdropFilter: 'blur(8px)' }}>
                    {img.category}
                  </div>

                  {/* Featured star */}
                  {img.isFeatured && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.9)' }}>
                      <Star size={11} className="text-white fill-white" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(13,10,20,0.95) 0%, transparent 60%)' }}>
                    {img.caption && <p className="text-white/70 text-xs mb-2 line-clamp-1">{img.caption}</p>}
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleFeatured(img)}
                        className="flex-1 h-7 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all"
                        style={{ background: img.isFeatured ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.12)', color: img.isFeatured ? '#D4AF37' : 'rgba(255,255,255,0.7)' }}>
                        {img.isFeatured ? <><StarOff size={10} />Unfeature</> : <><Star size={10} />Feature</>}
                      </button>
                      <button onClick={() => openEdit(img)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.12)' }}>
                        <Edit2 size={11} />
                      </button>
                      <button onClick={() => handleDelete(img.id)} disabled={deleting === img.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 transition-all"
                        style={{ background: 'rgba(239,68,68,0.15)' }}>
                        {deleting === img.id
                          ? <div className="w-3 h-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
                          : <Trash2 size={11} />
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* List view */}
      {viewMode === 'list' && !loading && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.12)' }}>
          {images.length === 0 ? (
            <div className="text-center py-12 text-white/25 text-sm">No images yet</div>
          ) : images.map((img, i) => (
            <motion.div key={img.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                <Image src={img.url} alt="" fill className="object-cover" sizes="56px" unoptimized={img.url.startsWith('http')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-sm truncate">{img.caption || 'No caption'}</p>
                <p className="text-[#d4af37] text-[10px] uppercase tracking-wide mt-0.5">{img.category}</p>
              </div>
              {img.isFeatured && (
                <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                  Featured
                </span>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleFeatured(img)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] transition-all">
                  {img.isFeatured ? <StarOff size={14} /> : <Star size={14} />}
                </button>
                <button onClick={() => openEdit(img)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#d4af37] hover:bg-[rgba(212,175,55,0.1)] transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AdminModal open={addOpen} onClose={() => { setAddOpen(false); setForm({ url:'', caption:'', category:'Hair', isFeatured:false }); }}
        title="Add Image to Gallery" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <AdminInput label="Image URL *" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            required placeholder="https://firebasestorage.googleapis.com/..." hint="Paste a direct image URL from Firebase Storage, Cloudinary, etc." />

          {form.url && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/5">
              <Image src={form.url} alt="Preview" fill className="object-cover" sizes="400px" unoptimized />
            </div>
          )}

          <AdminInput label="Caption (optional)" value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} placeholder="Describe this image..." />
          <AdminSelect label="Category *" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as GalleryCategory }))} options={CAT_OPTS} />

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/[0.03] transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative w-10 h-5 shrink-0">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full transition-all duration-200 peer-checked:bg-[#d4af37] bg-white/10" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Feature on website</p>
              <p className="text-white/25 text-xs">Highlighted in the public gallery section</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
              {submitting ? 'Adding...' : 'Add to Gallery'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal open={!!editImage} onClose={() => setEditImage(null)} title="Edit Image" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          {editImage && (
            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-white/5">
              <Image src={editImage.url} alt="" fill className="object-cover" sizes="400px" unoptimized />
            </div>
          )}
          <AdminInput label="Caption" value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} placeholder="Image caption..." />
          <AdminSelect label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as GalleryCategory }))} options={CAT_OPTS} />
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-10 h-5 shrink-0">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full transition-all duration-200 peer-checked:bg-[#d4af37] bg-white/10" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 peer-checked:translate-x-5" />
            </div>
            <span className="text-white/60 text-sm">Featured image</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditImage(null)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
