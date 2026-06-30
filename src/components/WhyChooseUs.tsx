'use client';

import { motion } from 'framer-motion';
import { UserCheck, Sparkles, ShieldCheck, Coffee, Award, Zap, Smile } from 'lucide-react';

function Crown({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

const features = [
  { title: 'Experienced Professionals', desc: 'Our trained beauty experts stay updated with the latest trends to deliver exceptional results.', icon: UserCheck,  hoverBg: '#0891B2', hoverText: '#ffffff', hoverShadow: 'rgba(8,145,178,0.45)' },
  { title: 'Personalized Consultation', desc: 'Every client is unique. We recommend treatments that best suit your individual beauty needs.',  icon: Award,       hoverBg: '#d4af37', hoverText: '#ffffff', hoverShadow: 'rgba(212,175,55,0.45)' },
  { title: 'Premium Quality Products',  desc: 'We use trusted, high-quality beauty products to ensure the safety and well-being of our clients.', icon: Sparkles,   hoverBg: '#d4af37', hoverText: '#ffffff', hoverShadow: 'rgba(212,175,55,0.45)' },
  { title: 'Hygienic Environment',      desc: 'We follow strict hygiene protocols and maintain a clean, sanitized environment for every service.', icon: ShieldCheck, hoverBg: '#16A34A', hoverText: '#ffffff', hoverShadow: 'rgba(22,163,74,0.45)' },
  { title: 'Modern Beauty Techniques',  desc: 'Equipped with the latest tools and contemporary methods for superior beauty outcomes.',          icon: Zap,         hoverBg: '#2563EB', hoverText: '#ffffff', hoverShadow: 'rgba(37,99,235,0.45)' },
  { title: 'Relaxing Ambience',         desc: 'Our thoughtfully designed salon space provides a peaceful escape from everyday stress.',        icon: Coffee,      hoverBg: '#92400E', hoverText: '#ffffff', hoverShadow: 'rgba(146,64,14,0.45)' },
  { title: 'Affordable Luxury',         desc: 'Premium salon experiences at accessible prices, bringing elegance to every woman in Chennai.',  icon: Crown,       hoverBg: '#d4af37', hoverText: '#ffffff', hoverShadow: 'rgba(212,175,55,0.45)' },
  { title: 'Exceptional Service',       desc: 'Your comfort and happiness are at the heart of everything we do, ensuring a flawless experience.', icon: Smile,   hoverBg: '#EAB308', hoverText: '#07050A', hoverShadow: 'rgba(234,179,8,0.45)' },
];

export function WhyChooseUs() {
  return (
    <section className="py-36 bg-[#f7f7f5] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="floating-blob w-[480px] h-[480px] top-1/4 left-0 opacity-40" />
      <div className="floating-blob floating-blob-2 w-[400px] h-[400px] bottom-0 right-0 opacity-40" />

      {/* Top/bottom rules */}
      <div className="absolute top-0 inset-x-0 premium-divider" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="section-label">The Lakshana Difference</motion.span>

          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-headline font-light text-[#1f355e]"
            style={{ fontSize: 'clamp(2.8rem,6vw,5rem)' }}>
            Why Clients{' '}
            <span className="luxury-cursive text-[#d4af37]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3.2rem,7vw,5.5rem)' }}>
              Love Us
            </span>
          </motion.h2>

          <motion.div initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.9 }} className="h-[1px] bg-[#d4af37]/35 mx-auto" />
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="glass-card group p-8 space-y-6 relative overflow-hidden cursor-default"
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#d4af37]/0 group-hover:border-[#d4af37]/25 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-[#d4af37]/0 group-hover:border-[#d4af37]/25 transition-all duration-500" />

                {/* Icon */}
                <div
                  className="w-14 h-14 border border-[#d4af37]/18 flex items-center justify-center text-[#d4af37] transition-all duration-500"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = feature.hoverBg;
                    el.style.color = feature.hoverText;
                    el.style.borderColor = feature.hoverBg;
                    el.style.boxShadow = `0 0 24px ${feature.hoverShadow}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = '';
                    el.style.color = '#d4af37';
                    el.style.borderColor = 'rgba(212,175,55,0.18)';
                    el.style.boxShadow = '';
                  }}
                >
                  <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.4 }}>
                    <Icon size={24} strokeWidth={1.3} />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="space-y-3">
                  <h3 className="font-headline text-lg font-medium text-[#1f355e] group-hover:text-[#d4af37] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#4a5f7f] leading-relaxed font-light">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom pink sweep */}
                <span
                  className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: `linear-gradient(to right, ${feature.hoverBg}, transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
