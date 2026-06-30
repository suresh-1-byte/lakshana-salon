'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';

const offers = [
  {
    title: 'Monthly Glow Package',
    price: '1,999',
    save: '600',
    services: 'Fruit Facial + Hair Spa + Classic Manicure + Eyebrow Threading',
    validity: 'Valid for 1 Month',
    bestseller: false,
  },
  {
    title: 'Hair Care Package',
    price: '3,499',
    save: '1,200',
    services: 'Keratin Treatment + Hair Spa + Hair Wash & Blow Dry + Scalp Treatment',
    validity: 'Valid for 1 Visit',
    bestseller: true,
  },
  {
    title: 'Skin Rejuvenation Package',
    price: '4,499',
    save: '1,500',
    services: 'Hydra Facial + De-Tan Treatment + Gold Facial + Face Bleach',
    validity: 'Valid for 1 Month',
    bestseller: true,
  },
  {
    title: 'Festive Beauty Package',
    price: '6,999',
    save: '2,000',
    services: 'HD Makeup + Hairstyling + Saree Draping + Waxing + Nail Art',
    validity: 'Perfect for Weddings & Festivals',
    bestseller: false,
  },
];

export function SpecialOffers() {
  return (
    <section id="offers" className="py-36 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative top rule */}
      <div className="absolute top-0 inset-x-0 premium-divider" />
      <div className="absolute bottom-0 inset-x-0 premium-divider" />

      {/* Ambient blobs */}
      <div className="floating-blob w-[500px] h-[500px] top-0 right-0 opacity-45" />
      <div className="floating-blob floating-blob-2 w-[360px] h-[360px] bottom-0 left-0 opacity-40" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="section-label">Limited Time</motion.span>

          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-headline font-light text-[#2D1B25]"
            style={{ fontSize: 'clamp(2.8rem,6vw,5.5rem)' }}>
            Special{' '}
            <span className="luxury-cursive text-[#d4af37]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3.2rem,7vw,6rem)' }}>
              Offers
            </span>
          </motion.h2>

          <motion.div initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.9 }} className="h-[1px] bg-[#d4af37]/40 mx-auto" />

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="text-[#7B4F62] font-light max-w-xl mx-auto leading-relaxed italic">
            Handcrafted beauty packages designed to give you the most value for your self-care journey.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(255,240,245,0.95) 100%)',
                border: offer.bestseller ? '1px solid rgba(212,175,55,0.38)' : '1px solid rgba(212,175,55,0.15)',
                boxShadow: offer.bestseller
                  ? '0 0 40px rgba(212,175,55,0.10), 0 12px 40px rgba(45,27,37,0.10)'
                  : '0 8px 30px rgba(45,27,37,0.07)',
                transition: 'all 0.55s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* Bestseller badge */}
              {offer.bestseller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#d4af37] text-white px-5 py-1 text-[8px] font-bold uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(212,175,55,0.4)] z-20">
                  <Sparkles size={9} />
                  Bestseller
                </div>
              )}

              {/* Inner top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-9 pt-12 flex flex-col flex-1 space-y-7">
                {/* Title */}
                <h3 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#d4af37] leading-relaxed group-hover:text-[#2D1B25] transition-colors duration-[400ms]">
                  {offer.title}
                </h3>

                {/* Price */}
                <div className="space-y-1">
                  <div className="font-headline text-[2.6rem] font-light text-[#2D1B25] leading-none">
                    ₹{offer.price}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-semibold">
                      Save ₹{offer.save}
                    </span>
                    <div className="h-[1px] flex-1 bg-[#d4af37]/20" />
                  </div>
                </div>

                {/* Services list */}
                <p className="text-xs text-[#7B4F62] font-light leading-relaxed min-h-[64px]">
                  {offer.services}
                </p>

                {/* Validity */}
                <div className="flex items-center gap-2.5 text-[#B89BAA]">
                  <Clock size={11} className="text-[#d4af37]" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#B89BAA]">
                    {offer.validity}
                  </span>
                </div>

                {/* CTA */}
                <div className="pt-3 mt-auto">
                  <Button
                    className="w-full bg-transparent border border-[#d4af37]/35 text-[#7B4F62] hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white rounded-none h-12 text-[10px] font-bold tracking-[0.32em] uppercase transition-all duration-500 btn-luxury"
                  >
                    Book Package
                  </Button>
                </div>
              </div>

              {/* Bottom glow line */}
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-[#d4af37] to-transparent group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
