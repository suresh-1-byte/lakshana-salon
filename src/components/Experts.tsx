'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const experts = [
  {
    id: 'expert-priya',
    name: 'Priya Lakshana',
    title: 'Founder & Creative Director',
    details: '8+ Years • Hair Styling, Bridal Makeup',
    bio: 'The heart and soul of Lakshana. Priya specializes in transformative bridal looks and managing high-end salon operations with effortless grace.',
  },
];

export function Experts() {
  return (
    <section id="experts" className="py-36 bg-[#FFF0F5] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="floating-blob w-[400px] h-[400px] top-0 left-1/4 opacity-40" />
      <div className="floating-blob floating-blob-2 w-[300px] h-[300px] bottom-0 right-1/4 opacity-35" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-24 space-y-7"
        >
          <span className="section-label">The Artisans</span>
          <h2 className="font-headline font-light text-[#2D1B25]"
            style={{ fontSize: 'clamp(2.8rem,6vw,5rem)' }}>
            Meet Our{' '}
            <span className="luxury-cursive text-[#d4af37]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3.2rem,7vw,6rem)' }}>
              Experts
            </span>
          </h2>
          <div className="premium-divider max-w-[140px] mx-auto" />
          <p className="text-[#7B4F62] font-light max-w-xl mx-auto leading-relaxed">
            Our passionate team of certified beauty professionals is here to make you
            look and feel your absolute best.
          </p>
        </motion.div>

        {/* Expert Cards */}
        <div className="flex justify-center">
          {experts.map((expert, index) => {
            const img = PlaceHolderImages.find((i) => i.id === expert.id);
            const imageUrl = expert.id === 'expert-priya' ? '/image.png' : (img?.imageUrl || '');
            return (
              <motion.div
                key={expert.name}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col items-center text-center space-y-7"
              >
                {/* Portrait */}
                <div className="relative w-60 h-60 flex-shrink-0">
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border border-[#d4af37]/15 scale-[1.07] group-hover:border-[#d4af37]/45 group-hover:scale-[1.1] transition-all duration-700" />
                  <div className="absolute inset-0 rounded-full border border-[#d4af37]/06 scale-[1.14] group-hover:border-[#d4af37]/18 transition-all duration-700" />

                  <div className="relative w-60 h-60 rounded-full overflow-hidden border border-[#d4af37]/25 group-hover:border-[#d4af37]/60 transition-all duration-700 shadow-[0_20px_60px_rgba(45,27,37,0.12)]"
                    style={{ boxShadow: '0 20px 60px rgba(45,27,37,0.12), 0 0 0 0 rgba(212,175,55,0)' }}>
                    <Image
                      src={imageUrl}
                      alt={expert.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[800ms] scale-105 group-hover:scale-110"
                    />
                    {/* Inner vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FFF0F5]/20 group-hover:to-transparent transition-all duration-700" />
                    {/* Pink overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/05 transition-all duration-700" />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4 px-2">
                  <h3 className="font-headline text-xl font-medium text-[#2D1B25] group-hover:text-[#d4af37] transition-colors duration-[400ms]">
                    {expert.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-[#7B4F62] group-hover:text-[#d4af37] transition-colors duration-[400ms]">
                    {expert.title}
                  </p>
                  <div className="h-[1px] w-10 bg-[#d4af37]/30 mx-auto group-hover:w-16 group-hover:bg-[#d4af37]/70 transition-all duration-500" />
                  <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#B89BAA]">
                    {expert.details}
                  </p>
                  <p className="text-xs text-[#7B4F62] font-light leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                    {expert.bio}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
