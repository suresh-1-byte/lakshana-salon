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
        className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-[#D4447A] via-[#E8A0B4] to-[#D4447A] transition-all duration-100"
        style={{ width: `${scrollProg}%` }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          scrolled
            ? 'pt-3 pb-3 bg-[rgba(255,255,255,0.97)] backdrop-blur-[32px] border-b border-[rgba(212,68,122,0.12)] shadow-[0_4px_30px_rgba(45,27,37,0.08)]'
            : 'pt-8 pb-5 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

          {/* ── Logo + Name ───────────────────────────────── */}
          <Link href="/" className="group flex flex-row items-center relative" style={{ gap: '18px' }}>
            {/* LP Beauty Salon Logo - Transparent (Optimized Size & Position) */}
            <div className="w-[44px] h-[44px] md:w-[54px] md:h-[54px] flex-shrink-0" style={{ marginTop: '-4px' }}>
              <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/lp-logo-transparent.png"
                  alt="Lakshana Beauty Salon"
                  fill
                  sizes="(max-width: 768px) 44px, 54px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            {/* name.png — vertically centered with logo, responsive sizing */}
            <div className="relative h-9 w-28 md:h-12 md:w-56 flex-shrink-0">
              <Image
                src="/name.png"
                alt="Lakshana"
                fill
                sizes="(max-width: 768px) 112px, 224px"
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
                className={`nav-link transition-colors duration-500 hover:text-[#D4447A] ${
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
              className="btn-luxury bg-[#D4447A] hover:bg-[#B03060] text-white font-semibold rounded-none h-11 px-9 text-[10px] tracking-[0.25em] uppercase border border-[#D4447A]/60 hover:border-[#B03060] transition-all duration-500 shadow-[0_0_20px_rgba(212,68,122,0.22)]"
            >
              <Link href="#appointment">Book Appointment</Link>
            </Button>
          </div>

          {/* ── Mobile Toggle ─────────────────────────────── */}
          <button
            className={`md:hidden p-2 hover:text-[#D4447A] transition-colors duration-300 ${
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
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setMobileOpen(false)}
              />
              
              {/* Slide-in menu from right */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="md:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl z-50 overflow-y-auto"
              >
                {/* Menu Header */}
                <div className="sticky top-0 bg-white border-b border-[#D4447A]/10 px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <div className="w-9 h-9" style={{ marginTop: '-2px' }}>
                      <Image
                        src="/lp-logo-transparent.png"
                        alt="Lakshana Beauty Salon"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[#D4447A] font-semibold text-sm tracking-wider">MENU</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#D4447A]/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} className="text-[#2D1B25]" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      >
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between px-4 py-3.5 rounded-xl text-[#2D1B25] hover:bg-gradient-to-r hover:from-[#D4447A]/5 hover:to-transparent hover:text-[#D4447A] transition-all duration-200 font-medium text-[15px]"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span>{link.name}</span>
                          <svg
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative divider */}
                  <div className="my-6 px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#D4447A]/20 to-transparent" />
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="px-2"
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[#D4447A] to-[#E85A8F] hover:from-[#B03060] hover:to-[#D4447A] text-white font-semibold rounded-xl h-12 text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-[#D4447A]/30 transition-all duration-300"
                    >
                      <Link href="#appointment" onClick={() => setMobileOpen(false)}>
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </span>
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Contact info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="mt-8 px-4 py-4 bg-gradient-to-br from-[#FDF8F5] to-white rounded-xl border border-[#D4447A]/10"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4447A] font-bold mb-2">Get in Touch</p>
                    <p className="text-xs text-[#2D1B25]/70 leading-relaxed">
                      Premium beauty services in Nolambur, Chennai
                    </p>
                  </motion.div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
