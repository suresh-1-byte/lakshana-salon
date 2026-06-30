'use client';

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const contactItems = [
  {
    icon: MapPin,
    label: 'Salon Address',
    value: 'Nolambur, Maduravoyal,\nChennai, Tamil Nadu',
    hoverBg: 'group-hover:bg-[#EF4444] group-hover:border-[#EF4444]',
  },
  {
    icon: Phone,
    label: 'Phone Number',
    value: '+91 98765 43210',
    hoverBg: 'group-hover:bg-[#22C55E] group-hover:border-[#22C55E]',
  },
  {
    icon: Mail,
    label: 'Email Address',
    value: 'hello@lakshanasalon.com',
    hoverBg: 'group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6]',
  },
];

export function ContactSection() {
  const contactImage = PlaceHolderImages.find((i) => i.id === 'contact-img');

  return (
    <section id="contact" className="py-36 bg-[#FFF0F5] relative overflow-hidden">
      {/* Ambient */}
      <div className="floating-blob w-[440px] h-[440px] top-0 right-0 opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* ── Left column ──────────────────────────────── */}
          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <span className="section-label">Location & Hours</span>
              <h2 className="font-headline font-light leading-tight text-[#2D1B25]"
                style={{ fontSize: 'clamp(2.8rem,5.5vw,5rem)' }}>
                Visit Our <br />
                <span className="luxury-cursive text-[#d4af37]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3rem,6vw,5.5rem)' }}>
                  Sanctuary
                </span>
              </h2>
              <p className="text-[#7B4F62] font-light leading-relaxed max-w-md text-base">
                Experience the finest beauty care in Chennai. Our Nolambur salon is designed to be
                your personal escape for self-care.
              </p>
            </motion.div>

            {/* Contact items */}
            <div className="space-y-8">
              {contactItems.map(({ icon: Icon, label, value, hoverBg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-5 group"
                >
                  <div className={`w-12 h-12 border border-[#d4af37]/22 flex items-center justify-center text-[#d4af37] group-hover:text-white transition-all duration-500 shrink-0 ${hoverBg}`}>
                    <Icon size={20} strokeWidth={1.3} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#d4af37]">{label}</h4>
                    <p className="text-sm text-[#7B4F62] font-light leading-relaxed whitespace-pre-line">{value}</p>
                  </div>
                </motion.div>
              ))}

              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-5 group"
              >
                <div className="w-12 h-12 border border-[#d4af37]/22 flex items-center justify-center text-[#d4af37] group-hover:bg-[#F59E0B] group-hover:text-white group-hover:border-[#F59E0B] transition-all duration-500 shrink-0">
                  <Clock size={20} strokeWidth={1.3} />
                </div>
                <div className="space-y-3 pt-1 w-full">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#d4af37]">Business Hours</h4>
                  <div className="flex justify-between items-center border-b border-[#d4af37]/[0.08] pb-2">
                    <span className="text-sm text-[#7B4F62] font-light">Monday – Sunday</span>
                    <span className="text-sm text-[#2D1B25] font-light">10:00 AM – 8:00 PM</span>
                  </div>
                  <p className="text-[9px] text-[#d4af37]/70 tracking-[0.38em] uppercase font-bold">Open All Days</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── Right column ─────────────────────────────── */}
          <div className="space-y-7">
            {/* Salon photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[380px] w-full overflow-hidden group image-luxury-frame"
              style={{ border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <Image
                src={contactImage?.imageUrl || ''}
                alt="Lakshana Reception"
                fill
                className="object-cover brightness-[0.68] opacity-85 transition-all duration-[1.5s] group-hover:opacity-100 group-hover:brightness-[0.82] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#2D1B25]/50 z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-[9px] uppercase tracking-[0.5em] text-[#e5c158] font-bold">Our Welcoming Space</p>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 1 }}
              className="relative h-[280px] w-full group overflow-hidden"
              style={{ border: '1px solid rgba(212,175,55,0.12)' }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.5126866160163!2d80.16540647476602!3d13.066699312787864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5261545464593d%3A0xc34857b282937740!2sNolambur%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) contrast(1.1) brightness(0.65)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-45 group-hover:opacity-100 transition-opacity duration-700"
              />
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#d4af37]/40 z-10 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#d4af37]/40 z-10 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
