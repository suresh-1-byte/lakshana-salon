'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Target, Eye, Sparkles, Gem, ShieldCheck, Heart, Zap } from 'lucide-react';

const values = [
  { title: 'Excellence',  desc: 'Delivering quality in every service.',   icon: Gem,        initial: 'E', hoverBg: '#7C3AED', hoverText: '#ffffff', hoverShadow: 'rgba(124,58,237,0.45)' },
  { title: 'Integrity',   desc: 'Building trust through honesty.',         icon: ShieldCheck, initial: 'I', hoverBg: '#16A34A', hoverText: '#ffffff', hoverShadow: 'rgba(22,163,74,0.45)' },
  { title: 'Innovation',  desc: 'Adapting to evolving trends.',            icon: Zap,        initial: 'N', hoverBg: '#2563EB', hoverText: '#ffffff', hoverShadow: 'rgba(37,99,235,0.45)' },
  { title: 'Care',        desc: 'Prioritizing comfort & well-being.',      icon: Heart,      initial: 'C', hoverBg: '#DC2626', hoverText: '#ffffff', hoverShadow: 'rgba(220,38,38,0.45)' },
  { title: 'Passion',     desc: 'Striving for perfection.',                icon: Sparkles,   initial: 'P', hoverBg: '#D4447A', hoverText: '#ffffff', hoverShadow: 'rgba(212,68,122,0.45)' },
];

// Use inline motion props instead of shared variants to avoid TS ease-array issues

export function About() {
  const img1 = PlaceHolderImages.find((i) => i.id === 'about-img-1');
  const img2 = PlaceHolderImages.find((i) => i.id === 'about-img-2');

  return (
    <section id="about" className="py-36 bg-[#FFFFFF] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="floating-blob w-[500px] h-[500px] top-0 right-0 opacity-60" />
      <div className="floating-blob floating-blob-2 w-[350px] h-[350px] bottom-20 left-0 opacity-50" />

      <div className="container mx-auto px-6 relative z-10">

        {/* ── Section Header ─────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-28 space-y-7">
          <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="section-label">The Lakshana Story</motion.span>

          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }}
            className="font-headline font-light leading-tight text-[#2D1B25]"
            style={{ fontSize: 'clamp(2.8rem,6vw,5.5rem)' }}>
            About{' '}
            <span className="block luxury-cursive text-[#D4447A] mt-2"
              style={{ fontSize: 'clamp(3rem,7vw,6rem)', lineHeight: 1.1 }}>
              Lakshana Salon
            </span>
          </motion.h2>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            className="premium-divider max-w-[200px] mx-auto" />
        </div>

        {/* ── About content — real story ──────────────── */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: story text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Year badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full"
                style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.2)' }}>
                <span className="text-[#D4447A] text-xs font-bold uppercase tracking-[0.35em]">Est. 2015</span>
              </div>

              <blockquote className="border-l-[2px] border-[#D4447A]/40 pl-8 py-2">
                <p className="text-[#2D1B25] text-xl font-headline italic leading-relaxed">
                  &ldquo;Founded on a passion for beauty, continuous learning, and a commitment to excellence.&rdquo;
                </p>
              </blockquote>

              <p className="text-[#7B4F62] leading-relaxed font-light text-base">
                What began as a small home-based beauty parlour has grown into a trusted destination
                for premium beauty and aesthetic services in Chennai. Our strength lies in expertise —
                from skin and hair care to bridal makeup and advanced aesthetic treatments, every service
                is backed by professional knowledge, experience, and attention to detail.
              </p>

              <p className="text-[#7B4F62] leading-relaxed font-light text-base">
                At Lakshana Salon, we believe every client deserves a clean, luxurious, and relaxing
                experience. With high standards of hygiene, personalized care, and exceptional service,
                we are dedicated to helping every woman look beautiful, feel confident, and leave with a smile.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { number: '10+', label: 'Years of\nExcellence' },
                  { number: '5000+', label: 'Happy\nClients' },
                  { number: '50+', label: 'Premium\nServices' },
                ].map(({ number, label }) => (
                  <div key={label} className="text-center p-4 rounded-2xl"
                    style={{ background: 'rgba(212,68,122,0.05)', border: '1px solid rgba(212,68,122,0.12)' }}>
                    <p className="font-headline text-2xl font-semibold text-[#D4447A] leading-none">{number}</p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#B89BAA] font-semibold mt-1.5 whitespace-pre-line leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[520px] overflow-hidden group image-luxury-frame"
              style={{ border: '1px solid rgba(212,68,122,0.2)' }}
            >
              <Image
                src={img1?.imageUrl || ''}
                alt="Lakshana Salon"
                fill
                className="object-cover brightness-[0.78] transition-all duration-[2s] group-hover:scale-105 group-hover:brightness-[0.88]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#2D1B25]/50 z-10 pointer-events-none" />
              <div className="absolute bottom-10 left-10 z-20">
                <span className="luxury-cursive text-4xl text-[#D4447A]"
                  style={{ fontFamily: "'Great Vibes', cursive" }}>
                  Lakshana Salon
                </span>
                <div className="h-[1px] w-20 bg-gradient-to-r from-[#D4447A]/60 to-transparent mt-2" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Values ─────────────────────────────────────── */}
        <div className="pt-24 border-t border-[rgba(212,68,122,0.08)]">
          <div className="text-center mb-20">
            <motion.h3
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9 }}
              className="font-headline font-light text-[#2D1B25]"
              style={{ fontSize: 'clamp(2.5rem,5.5vw,5rem)' }}>
              Our Core{' '}
              <span className="luxury-cursive text-[#D4447A]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3rem,6vw,5.5rem)' }}>
                Values
              </span>
            </motion.h3>
            <div className="premium-divider max-w-[140px] mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass-card group p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden"
              >
                {/* Ghost letter */}
                <span className="absolute -top-3 -right-3 text-[7rem] font-headline font-bold text-[#D4447A]/[0.04] pointer-events-none select-none leading-none group-hover:text-[#D4447A]/[0.08] transition-colors duration-700">
                  {v.initial}
                </span>

                {/* Icon — each card gets its own hover colour */}
                <div
                  className="w-16 h-16 rounded-full border border-[#D4447A]/20 flex items-center justify-center text-[#D4447A] transition-all duration-500 relative z-10"
                  style={
                    {
                      '--hover-bg': v.hoverBg,
                      '--hover-text': v.hoverText,
                      '--hover-shadow': `0 0 24px ${v.hoverShadow}`,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = v.hoverBg;
                    el.style.color = v.hoverText;
                    el.style.borderColor = v.hoverBg;
                    el.style.boxShadow = `0 0 24px ${v.hoverShadow}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = '';
                    el.style.color = '#D4447A';
                    el.style.borderColor = 'rgba(212,68,122,0.2)';
                    el.style.boxShadow = '';
                  }}
                >
                  <v.icon size={26} strokeWidth={1.2} />
                </div>

                <div className="space-y-3 relative z-10">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#D4447A] group-hover:text-[#2D1B25] transition-colors duration-[400ms]">
                    {v.title}
                  </h5>
                  <p className="text-[11px] text-[#7B4F62] uppercase tracking-[0.18em] font-light leading-relaxed">
                    {v.desc}
                  </p>
                </div>

                {/* Bottom accent line — colour matches icon hover */}
                <span
                  className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: `linear-gradient(to right, ${v.hoverBg}, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
