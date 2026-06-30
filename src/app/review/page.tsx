'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button"
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110 active:scale-95">
          <Star size={36}
            className={(hovered || value) > i ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#d4af37]/20'} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    rating: 5,
    comment: '',
    service: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.comment.trim()) {
      alert('Please fill in your name and review');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'qr_scan',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #f7f7f5 0%, #FFE4F0 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 20px 60px rgba(212,175,55,0.15)',
          }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
            <Check size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1f355e' }}>
            Thank You! ✨
          </h2>
          <p className="text-[#1f355e]/60 leading-relaxed mb-6">
            Your review has been submitted and will appear on our website once approved by our team.
          </p>
          <p className="text-sm text-[#d4af37] font-medium">
            We appreciate your feedback! 💕
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f7f7f5 0%, #FFE4F0 100%)' }}>
      
      {/* Ambient decorations */}
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full bg-[#d4af37]/10 blur-[80px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-48 h-48 rounded-full bg-[#e5c158]/15 blur-[60px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden relative z-10"
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 20px 60px rgba(212,175,55,0.15)',
          backdropFilter: 'blur(20px)',
        }}>
        
        {/* Header with logo */}
        <div className="relative h-32 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
          <Sparkles className="text-white/20 absolute top-4 right-6" size={24} />
          <div className="relative w-16 h-16 rounded-full mb-2"
            style={{ background: 'rgba(255,255,255,0.2)', padding: '4px' }}>
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" />
            </div>
          </div>
          <h1 className="text-white text-xl font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Share Your Experience
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#d4af37] mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
              placeholder="Enter your name"
              required
              className="w-full h-12 px-4 rounded-xl text-[#1f355e] text-sm bg-[#f7f7f5] border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#d4af37] mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))}
              placeholder="+91..."
              className="w-full h-12 px-4 rounded-xl text-[#1f355e] text-sm bg-[#f7f7f5] border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#d4af37] mb-3 text-center">
              Rate Your Experience *
            </label>
            <InteractiveStars value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
            <p className="text-center text-[#1f355e]/40 text-xs mt-2">
              {form.rating === 5 ? 'Excellent!' : form.rating === 4 ? 'Great!' : form.rating === 3 ? 'Good' : form.rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#d4af37] mb-2">
              Your Review *
            </label>
            <textarea
              value={form.comment}
              onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
              placeholder="Tell us about your experience..."
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-[#1f355e] text-sm bg-[#f7f7f5] border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#d4af37] mb-2">
              Service (Optional)
            </label>
            <input
              type="text"
              value={form.service}
              onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
              placeholder="e.g. Bridal Makeup, Hair Spa..."
              className="w-full h-12 px-4 rounded-xl text-[#1f355e] text-sm bg-[#f7f7f5] border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all disabled:opacity-60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8941f)',
              boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
            }}>
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Submit Review
              </>
            )}
          </button>

          <p className="text-xs text-center text-[#1f355e]/40 leading-relaxed">
            Your review will be reviewed by our team before appearing on our website
          </p>
        </form>
      </motion.div>
    </div>
  );
}
