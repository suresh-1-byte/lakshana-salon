'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Sparkles, X, ArrowRight, Plus, Check, ShoppingBag } from 'lucide-react';
import { serviceCategories } from '@/lib/services-data';
import { useCart } from '@/lib/cart-context';
import type { CartItem } from '@/lib/cart-context';

/* ─────────────────────────────────────────────
   CATEGORY BOX  — one card per category
───────────────────────────────────────────── */
function CategoryBox({
  category,
  catIndex,
  searchQuery,
  cart,
  onAdd,
  onRemove,
}: {
  category: (typeof serviceCategories)[0];
  catIndex: number;
  searchQuery: string;
  cart: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (name: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery) return category.services;
    return category.services.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [category.services, searchQuery]);

  if (searchQuery && filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: catIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.97)',
        border: `1.5px solid ${category.accent}28`,
        boxShadow: '0 4px 24px rgba(31,53,94,0.07)',
      }}
    >
      {/* ── Box header ─────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: `linear-gradient(135deg,${category.accent}18,${category.accent}08)`,
          borderBottom: `1px solid ${category.accent}22`,
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shrink-0"
          style={{
            background: `linear-gradient(135deg,${category.accent},#e5c158)`,
            boxShadow: `0 3px 10px ${category.accent}50`,
          }}
        >
          {category.icon}
        </div>
        <h3 className="text-[13px] font-bold text-[#1f355e] leading-snug">{category.title}</h3>
      </div>

      {/* ── Services list inside box ────────────────── */}
      <div className="flex flex-col flex-1 divide-y divide-[rgba(212,175,55,0.07)]">
        {filtered.map((svc, i) => {
          const inCart = cart.some((c) => c.name === svc.name);
          return (
            <div
              key={svc.name}
              className="group flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-[rgba(212,175,55,0.03)] transition-colors duration-150"
            >
              {/* Name + duration */}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#1f355e] leading-snug group-hover:text-[#b8941f] transition-colors duration-150 truncate">
                  {svc.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={9} className="text-[#B89BAA] shrink-0" />
                  <span className="text-[10px] text-[#B89BAA]">{svc.duration}</span>
                  {svc.note && (
                    <span
                      className="ml-1 text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: category.accent }}
                    >
                      {svc.note}
                    </span>
                  )}
                </div>
              </div>

              {/* Price + button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[12px] font-bold leading-none" style={{ color: category.accent }}>
                    {svc.member}
                  </p>
                  {svc.member !== svc.nonMember && (
                    <p className="text-[9px] text-[#B89BAA] line-through leading-none mt-0.5">{svc.nonMember}</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    inCart
                      ? onRemove(svc.name)
                      : onAdd({ name: svc.name, category: category.title, member: svc.member, duration: svc.duration })
                  }
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 ${
                    inCart ? 'text-white' : 'border'
                  }`}
                  style={
                    inCart
                      ? { background: category.accent }
                      : { border: `1.5px solid ${category.accent}`, color: category.accent }
                  }
                  aria-label={inCart ? 'Remove' : 'Add'}
                >
                  {inCart ? <Check size={11} /> : <Plus size={11} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING CART
───────────────────────────────────────────── */
function FloatingCart() {
  const { cart, clearCart } = useCart();
  const [expanded, setExpanded] = useState(false);

  if (cart.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-72 rounded-2xl overflow-hidden mb-1"
            style={{
              background: 'white',
              border: '1px solid rgba(212,175,55,0.18)',
              boxShadow: '0 16px 48px rgba(31,53,94,0.18)',
            }}
          >
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#d4af37,#e5c158)' }} />
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#d4af37]">
                  {cart.length} Service{cart.length > 1 ? 's' : ''} Selected
                </p>
                <button onClick={clearCart} className="text-[10px] text-[#B89BAA] hover:text-[#d4af37] transition-colors underline">
                  Clear all
                </button>
              </div>
              {cart.map((item) => (
                <div key={item.name} className="flex items-start gap-2">
                  <Sparkles size={10} className="text-[#d4af37] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#1f355e] leading-snug truncate">{item.name}</p>
                    <p className="text-[10px] text-[#B89BAA]">{item.duration} • <span className="text-[#d4af37]">{item.member}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
          onClick={() => setExpanded((p) => !p)}
          className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(31,53,94,0.2)]"
          style={{ background: 'white', border: '1px solid rgba(212,175,55,0.22)' }}
          aria-label="View selected services"
        >
          <ShoppingBag size={18} className="text-[#d4af37]" />
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#d4af37', boxShadow: '0 2px 8px rgba(212,175,55,0.5)' }}
          >
            {cart.length}
          </span>
        </motion.button>
        <motion.a
          href="#appointment"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 px-5 h-12 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.25em] whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg,#d4af37,#b8941f)', boxShadow: '0 8px 28px rgba(212,175,55,0.5)' }}
        >
          <span>Go to Booking</span>
          <ArrowRight size={13} />
        </motion.a>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export function Services() {
  const [search, setSearch] = useState('');
  const { cart, addItem, removeItem } = useCart();

  const addToCart = useCallback((item: CartItem) => addItem(item), [addItem]);
  const removeFromCart = useCallback((name: string) => removeItem(name), [removeItem]);

  const searchMatchCount = useMemo(() => {
    if (!search) return null;
    return serviceCategories.reduce(
      (acc, cat) =>
        acc + cat.services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())).length,
      0
    );
  }, [search]);

  return (
    <>
      <section id="services" className="py-24 bg-[#f7f7f5] relative overflow-hidden">
        <div className="floating-blob w-[450px] h-[450px] top-0 right-0 opacity-25 pointer-events-none" />
        <div className="floating-blob floating-blob-2 w-[350px] h-[350px] bottom-0 left-0 opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">

          {/* ── Section header ────────────────────────── */}
          <div className="text-center mb-12 space-y-5">
            <motion.span
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="section-label"
            >
              Service Menu
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="font-headline font-light text-[#1f355e]"
              style={{ fontSize: 'clamp(2.4rem,5.5vw,4.5rem)' }}
            >
              All{' '}
              <span
                className="text-[#d4af37]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(2.8rem,6.5vw,5.2rem)' }}
              >
                Services
              </span>
            </motion.h2>
            <motion.div
              initial={{ width: 0 }} whileInView={{ width: 80 }}
              viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
              className="h-[2px] mx-auto rounded-full"
              style={{ background: 'linear-gradient(90deg,transparent,#d4af37,#e5c158,transparent)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ background: 'linear-gradient(135deg,#d4af37,#e5c158)', boxShadow: '0 4px 18px rgba(212,175,55,0.3)' }}
            >
              <Sparkles size={11} />
              Members enjoy exclusive pricing on every service
            </motion.div>
          </div>

          {/* ── Search ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto mb-10"
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(212,175,55,0.18)',
                boxShadow: '0 2px 16px rgba(31,53,94,0.06)',
              }}
            >
              <Search size={15} className="text-[#d4af37] shrink-0" />
              <input
                type="text"
                placeholder="Search for services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[#1f355e] text-sm font-light placeholder:text-[#B89BAA] outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[#B89BAA] hover:text-[#d4af37] transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            {searchMatchCount !== null && (
              <p className="text-center text-[11px] text-[#B89BAA] mt-2 tracking-wide">
                {searchMatchCount === 0 ? 'No services found.' : `${searchMatchCount} service${searchMatchCount > 1 ? 's' : ''} found`}
              </p>
            )}
          </motion.div>

          {/* ── 3-column category grid ────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCategories.map((cat, i) => (
              <CategoryBox
                key={cat.id}
                category={cat}
                catIndex={i}
                searchQuery={search}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* ── Bottom CTA ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="mt-16 py-12 text-center rounded-3xl"
            style={{
              background: 'linear-gradient(135deg,rgba(212,175,55,0.07),rgba(229,193,88,0.05))',
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <p className="text-[#4a5f7f] font-light text-base mb-6">
              Not sure which service suits you? Let us help.
            </p>
            <a
              href="#appointment"
              className="inline-flex items-center gap-2.5 px-10 py-3.5 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-400"
              style={{
                background: 'linear-gradient(135deg,#d4af37,#b8941f)',
                boxShadow: '0 0 32px rgba(212,175,55,0.35)',
              }}
            >
              <Sparkles size={13} />
              Book a Free Consultation
            </a>
          </motion.div>

        </div>
      </section>

      <AnimatePresence>
        {cart.length > 0 && <FloatingCart />}
      </AnimatePresence>
    </>
  );
}

