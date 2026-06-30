'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['ALL', 'HAIR', 'SKIN', 'NAILS', 'HAIR SPA', 'INTERIORS'];

const galleryItems = [
  // ── WhatsApp uploaded images ─────────────────
  {
    id: 'wa-1',
    src: '/WhatsApp Image 2026-06-24 at 2.49.17 PM.jpeg',
    category: 'HAIR',
    label: 'Hair Styling',
    description: 'Professional salon styling',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 'wa-2',
    src: '/WhatsApp Image 2026-06-24 at 2.49.17 PM (1).jpeg',
    category: 'HAIR',
    label: 'Hair Treatment',
    description: 'Nourishing hair care ritual',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-3',
    src: '/WhatsApp Image 2026-06-24 at 2.49.18 PM.jpeg',
    category: 'SKIN',
    label: 'Skin Care',
    description: 'Rejuvenating facial treatment',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-4',
    src: '/WhatsApp Image 2026-06-24 at 2.49.18 PM (1).jpeg',
    category: 'NAILS',
    label: 'Nail Art',
    description: 'Creative nail design',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-5',
    src: '/WhatsApp Image 2026-06-24 at 2.49.18 PM (2).jpeg',
    category: 'HAIR',
    label: 'Hair Colour',
    description: 'Expert colour transformation',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-6',
    src: '/WhatsApp Image 2026-06-24 at 2.49.19 PM.jpeg',
    category: 'SKIN',
    label: 'Beauty Ritual',
    description: 'Premium skin care service',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-7',
    src: '/WhatsApp Image 2026-06-24 at 2.49.19 PM (1).jpeg',
    category: 'HAIR SPA',
    label: 'Hair Spa',
    description: 'Deep conditioning treatment',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'wa-8',
    src: '/WhatsApp Image 2026-06-24 at 2.49.20 PM.jpeg',
    category: 'INTERIORS',
    label: 'Our Salon',
    description: 'Luxurious salon ambiance',
    span: 'md:col-span-2 md:row-span-1',
  },
];

export function Gallery() {
  const [active, setActive] = useState('ALL');

  const filtered =
    active === 'ALL' ? galleryItems : galleryItems.filter((i) => i.category === active);

  return (
    <section id="gallery" className="py-36 bg-[#FFFFFF] overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="floating-blob w-[450px] h-[450px] top-0 left-0 opacity-35 pointer-events-none" />
      <div className="floating-blob floating-blob-2 w-[380px] h-[380px] bottom-0 right-0 opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="section-label">Our Portfolio</motion.span>

          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-headline font-light text-[#1f355e]"
            style={{ fontSize: 'clamp(2.8rem,6.5vw,5.5rem)' }}>
            World of{' '}
            <span className="luxury-cursive text-[#d4af37]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3.2rem,7.5vw,6.5rem)' }}>
              Transformation
            </span>
          </motion.h2>

          <motion.div initial={{ width: 0 }} whileInView={{ width: 120 }}
            viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.9 }}
            className="h-[2px] mx-auto rounded-full"
            style={{ background: 'linear-gradient(90deg,transparent,#d4af37,#e5c158,transparent)' }} />

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="text-[#4a5f7f] font-light max-w-xl mx-auto leading-relaxed">
            Every transformation tells a story. Explore real results from our salon.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActive(cat)}
              className={`px-8 py-3 text-[9px] tracking-[0.35em] font-bold uppercase transition-all duration-400 rounded-full ${
                active === cat
                  ? 'text-white shadow-[0_4px_20px_rgba(212,175,55,0.4)] scale-105'
                  : 'text-[#4a5f7f] hover:text-[#d4af37]'
              }`}
              style={
                active === cat
                  ? { background: 'linear-gradient(135deg,#d4af37,#e5c158)', border: 'none' }
                  : { background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(212,175,55,0.18)' }
              }
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[300px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`relative group overflow-hidden rounded-2xl ${item.span}`}
                style={{ border: '1px solid rgba(212,175,55,0.10)' }}
              >
                <Image
                  src={item.src}
                  alt={item.description}
                  fill
                  className="object-cover brightness-[0.8] transition-all duration-[1000ms] group-hover:scale-110 group-hover:brightness-[0.95]"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f355e]/80 via-[#1f355e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Category pill — always visible */}
                <div className="absolute top-4 left-4 z-20">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.32em] px-3 py-1.5 rounded-full text-white"
                    style={{ background: 'rgba(212,175,55,0.75)', backdropFilter: 'blur(8px)' }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Hover info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 p-5">
                  <h4 className="text-white font-headline text-lg font-medium leading-tight">{item.label}</h4>
                  <p className="text-white/75 text-[11px] font-light mt-0.5">{item.description}</p>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#d4af37]/0 group-hover:border-[#d4af37]/60 transition-all duration-500 z-20 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#d4af37]/0 group-hover:border-[#d4af37]/60 transition-all duration-500 z-20 rounded-bl-2xl" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
