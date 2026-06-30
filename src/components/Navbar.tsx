'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home',         href: '#' },
  { name: 'About',        href: '#about' },
  { name: 'Services',     href: '#services' },
  { name: 'Gallery',      href: '#gallery' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Contact',      href: '#contact' },
];

export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrollProg,  setScrollProg]  = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setScrolled(y > 50);
      setScrollProg(Math.min((y / max) * 100, 100));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Scroll Progress Bar ─────────────────────────── */}
      <div
        className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#d4af37] transition-all duration-100"
        style={{ width: `${scrollProg}%` }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          scrolled
            ? 'pt-3 pb-3 bg-[rgba(255,255,255,0.97)] backdrop-blur-[32px] border-b border-[rgba(212,175,55,0.12)] shadow-[0_4px_30px_rgba(45,27,37,0.08)]'
            : 'pt-8 pb-5 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

          {/* ── Logo + Name ───────────────────────────────── */}
          <Link href="/" className="group flex flex-row items-center gap-2 md:gap-3 relative">
            {/* Circular logo — isolated blend removes black bg */}
            <div style={{ isolation: 'isolate' }} className="w-9 h-9 md:w-12 md:h-12 flex-shrink-0">
              <div
                className="relative w-full h-full rounded-full transition-transform duration-500 group-hover:scale-105"
                style={{ background: 'transparent' }}
              >
                <Image
                  src="/logo.png?v=2"
                  alt="LP Beauty Salon Logo"
                  fill
                  sizes="(max-width: 768px) 36px, 48px"
                  className="object-contain rounded-full p-1"
                  priority
                />
              </div>
            </div>
            {/* name.png — aligned straight to logo, responsive sizing */}
            <div className="relative h-10 w-32 md:h-16 md:w-64 flex-shrink-0" style={{ marginTop: '-12px' }}>
              <Image
                src="/name.png"
                alt="Lakshana"
                fill
                sizes="(max-width: 768px) 128px, 256px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* ── Desktop Links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-link transition-colors duration-500 hover:text-[#d4af37] ${
                  scrolled ? 'text-[#2D1B25]/80' : 'text-white/90'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ── CTA Button ────────────────────────────────── */}
          <div className="hidden md:block">
            <Button
              asChild
              className="btn-luxury bg-[#d4af37] hover:bg-[#b8941f] text-white font-semibold rounded-none h-11 px-9 text-[10px] tracking-[0.25em] uppercase border border-[#d4af37]/60 hover:border-[#b8941f] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.22)]"
            >
              <Link href="#appointment">Book Appointment</Link>
            </Button>
          </div>

          {/* ── Mobile Toggle ─────────────────────────────── */}
          <button
            className={`md:hidden p-2 hover:text-[#d4af37] transition-colors duration-300 ${
              scrolled ? 'text-[#2D1B25]' : 'text-white'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span key="menu"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile Menu ───────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed inset-0 top-[76px] bg-[rgba(255,255,255,0.98)] backdrop-blur-[40px] z-40 border-t border-[rgba(212,175,55,0.12)]"
            >
              {/* Ambient blobs */}
              <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[rgba(212,175,55,0.06)] blur-[80px] pointer-events-none" />
              <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[rgba(229,193,88,0.06)] blur-[60px] pointer-events-none" />

              <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 + 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="font-headline text-2xl font-light text-[#2D1B25]/80 hover:text-[#d4af37] transition-colors duration-300 tracking-[0.08em]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  <Button
                    asChild
                    className="btn-luxury bg-[#d4af37] hover:bg-[#b8941f] text-white font-semibold rounded-none h-14 px-14 text-[10px] tracking-[0.3em] uppercase shadow-[0_0_24px_rgba(212,175,55,0.3)]"
                  >
                    <Link href="#appointment" onClick={() => setMobileOpen(false)}>
                      Book Appointment
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
