import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden pt-28 pb-12"
      style={{
        background: 'linear-gradient(180deg, #2D1B25 0%, #1A0D15 100%)',
        borderTop: '1px solid rgba(212,68,122,0.18)',
      }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[rgba(212,68,122,0.06)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[rgba(232,160,180,0.05)] blur-[80px] pointer-events-none" />

      {/* Top shimmer rule */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4447A]/30 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">

          {/* ── Brand ─────────────────────────────────── */}
          <div className="space-y-8">
            <Link href="/" className="group flex flex-row items-center gap-2 relative">
              {/* Isolated blend context: dark circle → black bg vanishes, pink logo shows */}
              <div style={{ isolation: 'isolate', width: '60px', height: '60px', flexShrink: 0 }}>
                <div
                  className="relative w-full h-full rounded-full transition-transform duration-500 group-hover:scale-105"
                  style={{ background: '#1A0D15' }}
                >
                  <Image
                    src="/logo.png"
                    alt="LP Beauty Salon Logo"
                    fill
                    sizes="60px"
                    className="object-contain rounded-full"
                    style={{ mixBlendMode: 'screen', filter: 'brightness(1.9) saturate(2.2) contrast(1.1)' }}
                  />
                </div>
              </div>
              {/* Brand name as image */}
              <div className="flex flex-col items-start leading-none">
                <div className="relative h-12 w-48 flex-shrink-0">
                  <Image
                    src="/name.png"
                    alt="Lakshana"
                    fill
                    sizes="192px"
                    className="object-contain object-left"
                  />
                </div>
                <span className="text-[6.5px] uppercase tracking-[0.45em] text-white/50 font-semibold mt-[2px] whitespace-nowrap">
                  Beauty Salon
                </span>
              </div>
            </Link>

            <p className="text-white/60 text-sm font-light leading-relaxed max-w-[220px]">
              Exclusive women&apos;s salon in Chennai, curated for those who treasure luxurious
              beauty rituals and premium care.
            </p>

            <div className="flex items-center gap-4">
              {/* Instagram — 3D branded colour on hover */}
              <a
                href="#"
                aria-label="Instagram"
                className="group/ig relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300
                  border border-white/15 bg-white/5 hover:scale-110 hover:shadow-[0_4px_20px_rgba(225,48,108,0.55)]"
                style={{ perspective: '400px' }}
              >
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover/ig:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #f9ce34 0%, #ee2a7b 40%, #6228d7 100%)',
                  }}
                />
                <svg viewBox="0 0 24 24" className="relative z-10 w-5 h-5 text-white/60 group-hover/ig:text-white transition-colors duration-300" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook — 3D branded colour on hover */}
              <a
                href="#"
                aria-label="Facebook"
                className="group/fb relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300
                  border border-white/15 bg-white/5 hover:scale-110 hover:shadow-[0_4px_20px_rgba(24,119,242,0.55)]"
              >
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover/fb:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(145deg, #1877f2 0%, #0c5fd6 100%)' }}
                />
                <svg viewBox="0 0 24 24" className="relative z-10 w-5 h-5 text-white/60 group-hover/fb:text-white transition-colors duration-300" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── Discover ──────────────────────────────── */}
          <div className="space-y-8">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.45em] text-[#D4447A]">Discover</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Services', 'Gallery', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="nav-link text-white/55 hover:text-[#E8A0B4] text-[11px]"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Our Menu ──────────────────────────────── */}
          <div className="space-y-8">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.45em] text-[#D4447A]">Our Menu</h4>
            <ul className="space-y-4">
              {['Hair Styling', 'Skin Rituals', 'Nail Artistry', 'Wellness'].map((item) => (
                <li key={item}>
                  <Link
                    href="#services"
                    className="nav-link text-white/55 hover:text-[#E8A0B4] text-[11px]"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Location ──────────────────────────────── */}
          <div className="space-y-8">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.45em] text-[#D4447A]">Location</h4>
            <ul className="space-y-6">
              {[
                { icon: MapPin, text: 'Nolambur, Chennai, Tamil Nadu' },
                { icon: Phone,  text: '+91 98765 43210' },
                { icon: Mail,   text: 'hello@lakshanasalon.com' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5 text-white/55 group">
                  <Icon size={15} strokeWidth={1.4} className="text-[#D4447A]/70 mt-0.5 shrink-0 group-hover:text-[#D4447A] transition-colors duration-300" />
                  <span className="text-sm font-light leading-relaxed whitespace-pre-line">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom row ────────────────────────────────── */}
        <div
          className="pt-12 flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ borderTop: '1px solid rgba(212,68,122,0.10)' }}
        >
          <p className="text-[8.5px] uppercase tracking-[0.35em] text-white/35 font-medium">
            © 2026 Lakshana Beauty Salon. Chennai&apos;s Premium Choice.
          </p>
          <div className="flex items-center gap-1">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D4447A]/35" />
            <div className="w-1 h-1 rounded-full bg-[#D4447A]/45" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D4447A]/35" />
          </div>
          <div className="flex items-center gap-6 text-[8.5px] uppercase tracking-[0.35em] text-white/35">
            <Link href="#" className="hover:text-[#E8A0B4] transition-colors duration-300">Privacy</Link>
            <Link href="#" className="hover:text-[#E8A0B4] transition-colors duration-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
