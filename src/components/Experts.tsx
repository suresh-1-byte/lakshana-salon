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
  {
    id: 'expert-divya',
    name: 'Divya Krishnan',
    title: 'Senior Hair Stylist',
    details: '6+ Years • Coloring, Keratin, Balayage',
    bio: "Divya is our expert hair artist with a sharp eye for detail. She excels in modern coloring techniques and restorative hair spa rituals.",
  },
  {
    id: 'expert-meena',
    name: 'Meena Rajesh',
    title: 'Skin Care Specialist',
    details: '5+ Years • Hydra Facial, Anti-Aging',
    bio: 'Meena brings deep skincare science to every facial, dedicated to helping clients achieve their best skin through personalized ritual care.',
  },
  {
    id: 'expert-kavitha',
    name: 'Kavitha Suresh',
    title: 'Nail Technician & Makeup Artist',
    details: '4+ Years • Nail Art, Gel, HD Makeup',
    bio: 'Kavitha turns every nail and face into a work of art, specializing in intricate nail designs and flawless festive makeup looks.',
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
            <span className="luxury-cursive text-[#D4447A]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
                  <div className="absolute inset-0 rounded-full border border-[#D4447A]/15 scale-[1.07] group-hover:border-[#D4447A]/45 group-hover:scale-[1.1] transition-all duration-700" />
                  <div className="absolute inset-0 rounded-full border border-[#D4447A]/06 scale-[1.14] group-hover:border-[#D4447A]/18 transition-all duration-700" />

                  <div className="relative w-60 h-60 rounded-full overflow-hidden border border-[#D4447A]/25 group-hover:border-[#D4447A]/60 transition-all duration-700 shadow-[0_20px_60px_rgba(45,27,37,0.12)]"
                    style={{ boxShadow: '0 20px 60px rgba(45,27,37,0.12), 0 0 0 0 rgba(212,68,122,0)' }}>
                    <Image
                      src={imageUrl}
                      alt={expert.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[800ms] scale-105 group-hover:scale-110"
                    />
                    {/* Inner vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FFF0F5]/20 group-hover:to-transparent transition-all duration-700" />
                    {/* Pink overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4447A]/0 to-[#D4447A]/0 group-hover:from-[#D4447A]/05 transition-all duration-700" />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4 px-2">
                  <h3 className="font-headline text-xl font-medium text-[#2D1B25] group-hover:text-[#D4447A] transition-colors duration-[400ms]">
                    {expert.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-[#7B4F62] group-hover:text-[#D4447A] transition-colors duration-[400ms]">
                    {expert.title}
                  </p>
                  <div className="h-[1px] w-10 bg-[#D4447A]/30 mx-auto group-hover:w-16 group-hover:bg-[#D4447A]/70 transition-all duration-500" />
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
