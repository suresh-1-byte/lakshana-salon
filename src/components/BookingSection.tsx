'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarCheck, Plus, X, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { serviceCategories } from '@/lib/services-data';
import { useCart } from '@/lib/cart-context';

const inputClass =
  'bg-white border border-[rgba(212,175,55,0.2)] rounded-xl h-12 text-[#2D1B25] placeholder:text-[#B89BAA]/70 font-light tracking-[0.04em] text-sm transition-all duration-300 focus:border-[rgba(212,175,55,0.55)] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.10)]';

// Flat list of all services for the dropdown
const allServices = serviceCategories.flatMap((cat) =>
  cat.services.map((s) => ({
    label: `${cat.title} — ${s.name}`,
    category: cat.title,
    name: s.name,
    member: s.member,
    duration: s.duration,
  }))
);

export function BookingSection() {
  const { cart, addItem, removeItem, clearCart } = useCart();
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [search,    setSearch]    = useState('');
  const [dropOpen,  setDropOpen]  = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const filtered = search.trim()
    ? allServices.filter((s) =>
        s.label.toLowerCase().includes(search.toLowerCase())
      )
    : allServices;

  const addService = (svc: (typeof allServices)[0]) => {
    addItem({
      name: svc.name,
      category: svc.category,
      member: svc.member,
      duration: svc.duration,
    });
    setSearch('');
    setDropOpen(false);
  };

  const removeService = (name: string) => {
    removeItem(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, services: cart }),
      });
      if (!res.ok) throw new Error('Booking failed');
      setConfirmed(true);
      clearCart();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setPhone(''); setEmail('');
    setConfirmed(false);
  };

  return (
    <section id="appointment" className="py-24 bg-[#FFF0F5] overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="floating-blob w-[420px] h-[420px] top-0 left-0 opacity-30 pointer-events-none" />
      <div className="floating-blob floating-blob-2 w-[320px] h-[320px] bottom-0 right-0 opacity-25 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12 space-y-4"
        >
          <span className="section-label flex items-center justify-center gap-2">
            <CalendarCheck size={12} /> Private Booking
          </span>
          <h2 className="font-headline font-light leading-tight text-[#2D1B25]"
            style={{ fontSize: 'clamp(2.4rem,5vw,4rem)' }}>
            Book Your{' '}
            <span className="luxury-cursive text-[#d4af37]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(2.8rem,5.5vw,4.6rem)' }}>
              Experience
            </span>
          </h2>
          <p className="text-[#7B4F62] font-light max-w-md mx-auto leading-relaxed">
            Select your services, fill in your details, and we&apos;ll confirm your appointment.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(255,240,245,0.95) 100%)',
            border: '1px solid rgba(212,175,55,0.16)',
            boxShadow: '0 16px 60px rgba(45,27,37,0.09)',
          }}
        >
          {/* Pink top shimmer */}
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#d4af37,#e5c158,#d4af37)' }} />

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-7">

            {/* Name + Phone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.38em] font-bold text-[#d4af37]">Full Name</label>
                <Input required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.38em] font-bold text-[#d4af37]">Phone</label>
                <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.38em] font-bold text-[#d4af37]">Email</label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com" className={inputClass} />
            </div>

            {/* Service selector */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.38em] font-bold text-[#d4af37] block">
                Select Services
              </label>

              {/* Search input with dropdown */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-text"
                  style={{
                    background: 'white',
                    border: `1px solid ${dropOpen ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`,
                    boxShadow: dropOpen ? '0 0 0 2px rgba(212,175,55,0.10)' : 'none',
                  }}
                  onClick={() => setDropOpen(true)}
                >
                  <Plus size={14} className="text-[#d4af37] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search and add services…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setDropOpen(true); }}
                    onFocus={() => setDropOpen(true)}
                    className="flex-1 bg-transparent text-sm text-[#2D1B25] placeholder:text-[#B89BAA] outline-none"
                  />
                  {search && (
                    <button type="button" onClick={() => { setSearch(''); setDropOpen(false); }}>
                      <X size={13} className="text-[#B89BAA] hover:text-[#d4af37]" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(45,27,37,0.15)]"
                      style={{ border: '1px solid rgba(212,175,55,0.18)', background: 'white', maxHeight: '280px', overflowY: 'auto' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filtered.length === 0 ? (
                        <p className="text-center text-[#B89BAA] text-sm py-5">No services found</p>
                      ) : (
                        <>
                          {/* Group by category */}
                          {serviceCategories.map((cat) => {
                            const catServices = filtered.filter((s) => s.category === cat.title);
                            if (catServices.length === 0) return null;
                            return (
                              <div key={cat.id}>
                                <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-[0.35em] sticky top-0"
                                  style={{ color: cat.accent, background: `${cat.accent}0f`, borderBottom: `1px solid ${cat.accent}18` }}>
                                  {cat.title}cart
                                </div>
                                {catServices.map((svc) => {
                                  const already = !!cart.find((s) => s.name === svc.name);
                                  return (
                                    <button
                                      key={svc.name}
                                      type="button"
                                      onClick={() => addService(svc)}
                                      disabled={already}
                                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[rgba(212,175,55,0.04)] transition-colors duration-150"
                                    >
                                      <div>
                                        <p className={`text-sm ${already ? 'text-[#B89BAA]' : 'text-[#2D1B25]'}`}>{svc.name}</p>
                                        <p className="text-[10px] text-[#B89BAA] mt-0.5">{svc.duration} • Member: {svc.member}</p>
                                      </div>
                                      {already
                                        ? <span className="text-[9px] text-[#B89BAA] font-bold uppercase tracking-wide">Added</span>
                                        : <Plus size={13} className="text-[#d4af37] shrink-0" />
                                      }
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Backdrop to close dropdown */}
                {dropOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                )}
              </div>

              {/* Selected services list */}
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-1"
                  >
                    {cart.map((svc, i) => (
                      <motion.div
                        key={svc.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
                      >
                        <div>
                          <p className="text-sm font-medium text-[#2D1B25]">{svc.name}</p>
                          <p className="text-[10px] text-[#B89BAA] mt-0.5">{svc.category} • {svc.duration} • <span style={{ color: '#d4af37' }}>{svc.member}</span></p>
                        </div>
                        <button type="button" onClick={() => removeService(svc.name)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(212,175,55,0.15)] transition-colors">
                          <X size={13} className="text-[#d4af37]" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {cart.length === 0 && (
                <p className="text-[11px] text-[#B89BAA] italic">No services added yet. Search above to add.</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={cart.length === 0 || loading}
              className="btn-luxury shine-on-hover w-full text-white font-bold rounded-xl h-14 tracking-[0.28em] uppercase text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg,#d4af37,#b8941f)',
                boxShadow: cart.length > 0 ? '0 0 30px rgba(212,175,55,0.35)' : 'none',
              }}
            >
              {loading
                ? <><Loader2 size={14} className="mr-2 animate-spin" /> Booking...</>
                : <><CalendarCheck size={14} className="mr-2" />
                    Book Appointment{cart.length > 0 ? ` (${cart.length} service${cart.length > 1 ? 's' : ''})` : ''}
                  </>
              }
            </Button>
          </form>
        </motion.div>
      </div>

      {/* ── Booking Confirmed Popup ─────────────────────── */}
      <AnimatePresence>
        {confirmed && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#2D1B25]/50 backdrop-blur-sm"
              onClick={resetForm}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-md rounded-3xl text-center overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg,#fff 0%,#FFF0F5 100%)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  boxShadow: '0 32px 80px rgba(45,27,37,0.2)',
                }}
              >
                {/* Pink top bar */}
                <div className="h-[4px]" style={{ background: 'linear-gradient(90deg,#d4af37,#e5c158,#d4af37)' }} />

                <div className="p-10 space-y-6">
                  {/* Animated check */}
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.15, damping: 18, stiffness: 260 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: 'linear-gradient(135deg,#d4af37,#e5c158)', boxShadow: '0 8px 32px rgba(212,175,55,0.45)' }}
                  >
                    <CheckCircle2 size={38} className="text-white" />
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="font-headline text-[2rem] font-medium text-[#2D1B25]">Booking Confirmed!</h3>
                    <p className="text-[#7B4F62] text-sm font-light leading-relaxed">
                      Thank you, <span className="font-medium text-[#d4af37]">{name}</span>!<br />
                      Our team will call you on <span className="font-medium text-[#2D1B25]">{phone}</span> shortly to confirm your appointment.
                    </p>
                  </div>

                  {/* Booked services summary */}
                  <div className="rounded-2xl p-4 space-y-2 text-left"
                    style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#d4af37] mb-2.5">Your Selected Services</p>
                    {cart.map((svc) => (
                      <div key={svc.name} className="flex items-start gap-2">
                        <Sparkles size={10} className="text-[#d4af37] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-[#2D1B25]">{svc.name}</p>
                          <p className="text-[10px] text-[#B89BAA]">{svc.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={resetForm}
                    className="w-full h-12 rounded-xl text-white text-[11px] font-bold uppercase tracking-[0.28em] btn-luxury"
                    style={{ background: 'linear-gradient(135deg,#d4af37,#b8941f)' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
