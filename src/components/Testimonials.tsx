'use client';

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const reviews = [
  {
    name: 'Sarah J.',
    role: 'Loyal Client',
    text: 'The service was exceptional and the entire experience felt luxurious. From the moment I walked in, I was treated like royalty. My bridal makeup was exactly what I dreamed of.',
    rating: 5,
    avatarId: 'client-1',
  },
  {
    name: 'Emily Davis',
    role: 'Fashion Consultant',
    text: "Truly the best salon in the city. The hair spa treatments are rejuvenating and the stylists are world-class. I won't go anywhere else for my hair needs.",
    rating: 5,
    avatarId: 'client-2',
  },
  {
    name: 'Jessica M.',
    role: 'Regular Customer',
    text: 'A haven of tranquility. Their skin treatments have completely transformed my complexion. Professional, hygienic, and incredibly skilled team.',
    rating: 5,
    avatarId: 'client-1',
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(id);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="testimonials" className="py-36 bg-[#FFF0F5] relative overflow-hidden">
      {/* Decorative rules */}
      <div className="absolute top-0 inset-x-0 premium-divider" />

      {/* Ambient quote watermark */}
      <div className="absolute top-16 right-12 opacity-[0.05] pointer-events-none select-none">
        <Quote size={220} className="text-[#D4447A]" />
      </div>

      {/* Ambient blob */}
      <div className="floating-blob w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="section-label">Voices of Elegance</motion.span>

          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-headline font-light text-[#2D1B25]"
            style={{ fontSize: 'clamp(2.8rem,6vw,5rem)' }}>
            What Our Clients{' '}
            <span className="luxury-cursive text-[#D4447A]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(3.2rem,7vw,5.5rem)' }}>
              Say
            </span>
          </motion.h2>

          <div className="premium-divider max-w-[120px] mx-auto" />
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {reviews.map((review, idx) => {
              const avatar = PlaceHolderImages.find((i) => i.id === review.avatarId);
              return (
                <div key={idx} className="flex-[0_0_100%] min-w-0 px-4 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8 }}
                    className="max-w-3xl w-full relative"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(255,240,245,0.95) 100%)',
                      border: '1px solid rgba(212,68,122,0.22)',
                      boxShadow: '0 12px 50px rgba(45,27,37,0.08), 0 0 0 1px rgba(212,68,122,0.05)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Inner top shimmer */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4447A]/30 to-transparent" />

                    <div className="p-14 text-center space-y-8">
                      {/* Avatar */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full border-2 border-[#D4447A]/20 scale-[1.12]" />
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4447A]/35 shadow-[0_0_24px_rgba(212,68,122,0.18)]">
                            <Image src={avatar?.imageUrl || ''} alt={review.name} fill className="object-cover" />
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex justify-center gap-1.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={15} fill="#D4447A" className="text-[#D4447A]" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="font-headline italic text-2xl leading-relaxed text-[#2D1B25]/90"
                        style={{ fontSize: 'clamp(1.15rem,2.5vw,1.5rem)' }}>
                        &ldquo;{review.text}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div>
                        <h4 className="font-bold tracking-[0.3em] uppercase text-sm text-[#D4447A] mb-1">
                          {review.name}
                        </h4>
                        <p className="text-[10px] text-[#B89BAA] uppercase tracking-[0.3em]">{review.role}</p>
                      </div>
                    </div>

                    {/* Bottom rule */}
                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4447A]/20 to-transparent" />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-3 mt-12">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`transition-all duration-[400ms] rounded-full ${
                idx === selectedIndex
                  ? 'w-10 h-[2px] bg-[#D4447A] shadow-[0_0_8px_rgba(212,68,122,0.5)]'
                  : 'w-4 h-[2px] bg-[#D4447A]/22 hover:bg-[#D4447A]/45'
              }`}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
