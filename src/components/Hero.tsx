'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';

export function Hero() {
  const sectionRef  = useRef<HTMLElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);

  // 0 = image/intro state · 1 = video/cinematic state (start at 1 for immediate video)
  const progress    = useMotionValue(1);
  const progressRef = useRef(1);

  // locked = scroll-jacked · unlocked = free scroll (start unlocked)
  const lockedRef    = useRef(false);
  const animatingRef = useRef(false);
  const [phase, setPhase] = useState<'intro' | 'done'>('done'); // start in done state

  // keep progressRef in sync
  useEffect(() => progress.on('change', (v) => { progressRef.current = v; }), [progress]);

  // ── Auto-play video immediately on load ─────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    
    // Aggressively try to play
    const playVideo = () => {
      vid.play().catch((err) => {
        console.log('Autoplay blocked:', err);
        // Try again on any user interaction
        const events = ['click', 'touchstart', 'keydown'];
        const tryPlay = () => {
          vid.play();
          events.forEach(e => document.removeEventListener(e, tryPlay));
        };
        events.forEach(e => document.addEventListener(e, tryPlay, { once: true }));
      });
    };
    
    // Try immediately
    playVideo();
    
    // Also try when video can play
    vid.addEventListener('loadeddata', playVideo, { once: true });
    vid.addEventListener('canplay', playVideo, { once: true });
  }, []);

  // ── Run the intro→cinematic animation ─────────────────
  const runForward = useCallback(() => {
    if (!lockedRef.current || animatingRef.current) return;
    animatingRef.current = true;

    // start video immediately
    videoRef.current?.play().catch(() => {});

    animate(progress, 1, {
      duration: 1.6,
      ease: [0.4, 0, 0.15, 1],
      onComplete: () => {
        animatingRef.current = false;
        lockedRef.current    = false;          // unlock scroll
        setPhase('done');
      },
    });
  }, [progress]);

  // ── Run the cinematic→intro reverse animation ──────────
  const runReverse = useCallback(() => {
    animatingRef.current = true;
    lockedRef.current    = true;               // re-lock immediately

    // Don't pause video - let it keep playing
    
    animate(progress, 0, {
      duration: 1.2,
      ease: [0.4, 0, 0.15, 1],
      onComplete: () => {
        animatingRef.current = false;
        setPhase('intro');
      },
    });
  }, [progress]);

  // ── Wheel / touch handlers ─────────────────────────────
  // Use stable refs so we can add/remove with the exact same function reference
  const wheelHandler      = useRef<(e: WheelEvent) => void>(() => {});
  const touchMoveHandler  = useRef<(e: TouchEvent) => void>(() => {});
  const touchStartHandler = useRef<(e: TouchEvent) => void>(() => {});
  const touchStartY       = useRef(0);

  // Update handler bodies whenever callbacks change
  useEffect(() => {
    wheelHandler.current = (e: WheelEvent) => {
      if (!lockedRef.current) return;          // unlocked → ignore
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY > 0) runForward();          // any downward tick → go
    };
    touchStartHandler.current = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    touchMoveHandler.current = (e: TouchEvent) => {
      if (!lockedRef.current) return;
      e.preventDefault();
      if (touchStartY.current - e.touches[0].clientY > 8) runForward();
    };
  }, [runForward]);

  // Attach once on mount using stable wrapper functions
  useEffect(() => {
    const wh = (e: WheelEvent) => wheelHandler.current(e);
    const ts = (e: TouchEvent) => touchStartHandler.current(e);
    const tm = (e: TouchEvent) => touchMoveHandler.current(e);

    window.addEventListener('wheel',      wh, { passive: false, capture: true });
    window.addEventListener('touchstart', ts, { passive: true,  capture: true });
    window.addEventListener('touchmove',  tm, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel',      wh, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchstart', ts, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchmove',  tm, { capture: true } as EventListenerOptions);
    };
  }, []);

  // ── Re-lock when user scrolls back to very top ─────────
  useEffect(() => {
    if (phase !== 'done') return;
    const onScroll = () => {
      if (window.scrollY < 5 && !lockedRef.current && !animatingRef.current) {
        runReverse();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [phase, runReverse]);

  // ── Motion-value-driven transforms ────────────────────

  // Background image: fully visible → fades out
  const imageOpacity = useTransform(progress, [0, 0.55], [1, 0]);

  // Video: hidden → fades in
  const videoOpacity = useTransform(progress, [0.3, 0.75], [0, 1]);

  // Eyebrow, subtitle, CTAs fade out early
  const fadeOut  = useTransform(progress, [0, 0.42], [1, 0]);
  const eyebrowY = useTransform(progress, [0, 0.42], [0, -22]);
  const subY     = useTransform(progress, [0, 0.42], [0, 18]);

  // Headline: shrinks + moves to top-left corner
  // transformOrigin: left top so it anchors to left edge
  const headlineScale = useTransform(progress, [0.25, 0.9], [1, 0.26]);
  const headlineX     = useTransform(progress, [0.25, 0.9], [0, -580]); // px
  const headlineY     = useTransform(progress, [0.25, 0.9], [0, -340]); // px
  const headlineFade  = useTransform(progress, [0.7, 0.9], [1, 0]);

  const fixedHeadlineOpacity = useTransform(progress, [0.65, 0.8, 1], [0, 0.3, 1]);
  const fixedHeadlineScale   = useTransform(progress, [0.65, 1], [0.75, 1]);
  const fixedHeadlineX       = useTransform(progress, [0.65, 1], [-20, 0]);
  const fixedHeadlineY       = useTransform(progress, [0.65, 1], [12, 0]);

  // Scroll indicator fades on first scroll interaction
  const scrollHintOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  // Suppress unused variable warnings — these transforms are intentionally
  // declared for potential future use (fixed headline overlay)
  void fixedHeadlineOpacity;
  void fixedHeadlineScale;
  void fixedHeadlineX;
  void fixedHeadlineY;

  return (
    <>
      {/* ── SECTION ─────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="hero-section"
        style={{ overflow: 'hidden' }}
      >
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />

        {/* ── Salon image background (intro state) ──────── */}
        <motion.div
          className="absolute inset-0 will-change-[opacity]"
          style={{ opacity: imageOpacity, zIndex: 1 }}
        >
          <Image
            src="/hero bg.png"
            alt="Lakshana Beauty Salon Interior"
            fill
            priority
            className="object-cover"
            style={{ filter: 'brightness(0.60) saturate(1.1)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(45,27,37,0.42) 0%, rgba(45,27,37,0.22) 40%, rgba(45,27,37,0.70) 85%, rgba(45,27,37,0.96) 100%)',
            }}
          />
        </motion.div>

        {/* ── Video background (cinematic state) ────────── */}
        <motion.div
          className="absolute inset-0 will-change-[opacity]"
          style={{ opacity: videoOpacity, zIndex: 2 }}
        >
          <video
            ref={videoRef}
            className="hero-background"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/web.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(255,192,203,0.18)', mixBlendMode: 'multiply', zIndex: 1 }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(45,27,37,0.4) 0%, rgba(45,27,37,0.2) 40%, rgba(45,27,37,0.65) 80%, rgba(45,27,37,0.92) 100%)',
              zIndex: 3,
            }} />
        </motion.div>

        {/* Overlays */}
        <div className="hero-shine"     style={{ zIndex: 3 }} />
        <div className="gold-half-fade" style={{ zIndex: 3 }} />

        {/* ── TOP-LEFT BADGE: fades in after animation ─────
            Sits at position:absolute so it stays within the hero
            section and scrolls away with it naturally.             */}
        <motion.div
          className="absolute will-change-transform pointer-events-none"
          style={{
            opacity:  fixedHeadlineOpacity,
            x:        fixedHeadlineX,
            y:        fixedHeadlineY,
            scale:    fixedHeadlineScale,
            top:      '92px',   // just below navbar
            left:     '24px',
            zIndex:   20,
            transformOrigin: 'left top',
          }}
        >
          <div
            className="px-4 py-3 backdrop-blur-sm"
            style={{
              background: 'rgba(45,27,37,0.55)',
              border: '1px solid rgba(229,193,88,0.3)',
              boxShadow: '0 4px 24px rgba(212,175,55,0.2)',
            }}
          >
            <p className="font-light leading-tight text-left"
              style={{ fontSize: 'clamp(0.7rem,1.2vw,0.95rem)' }}>
              <span className="block text-[#FCE4EC] tracking-tight"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Experience the
              </span>
              <span className="block text-white"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.1rem,1.9vw,1.55rem)',
                  lineHeight: 1.1,
                  textShadow: '0 0 20px rgba(212,175,55,0.5)',
                }}>
                luxury of self&#8209;care.
              </span>
            </p>
            <div className="mt-1.5 h-[1px]"
              style={{ background: 'linear-gradient(90deg,#d4af37,transparent)', width: '100%' }} />
          </div>
        </motion.div>

        {/* ── Content ───────────────────────────────────── */}
        <div
          className="hero-content container mx-auto px-6 text-center relative w-full pt-28"
          style={{ zIndex: 10 }}
        >
          <div className="max-w-5xl mx-auto">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ opacity: fadeOut, y: eyebrowY }}
              className="inline-flex items-center gap-5 mb-12 mt-6 will-change-transform"
            >
              <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#e5c158]/60" />
              <span className="text-[#e5c158] text-[9px] font-semibold tracking-[0.55em] uppercase">
                Nolambur&apos;s Finest Sanctuary
              </span>
              <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#e5c158]/60" />
            </motion.div>

            {/* CENTER headline — fades out as badge appears */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5 }}
              style={{ opacity: headlineFade }}
              className="leading-[1.05] mb-8 will-change-transform"
            >
              <span
                className="block text-[clamp(3.2rem,8vw,6.5rem)] font-light tracking-tight text-[#FCE4EC]"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  textShadow: '0 0 80px rgba(229,193,88,0.25)',
                }}
              >
                Experience the
              </span>
              <span
                className="block text-[clamp(3.5rem,9vw,7.5rem)] text-white mt-1"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontStyle: 'italic',
                  textShadow: '0 0 60px rgba(255,255,255,0.15)',
                  lineHeight: 1.1,
                }}
              >
                luxury of self&#8209;care.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75 }}
              style={{ opacity: fadeOut, y: subY }}
              className="text-white/85 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light tracking-wide mb-14 will-change-transform"
            >
              Discover a world where beauty is personalized, relaxation is essential,
              and every visit leaves you feeling refreshed, confident, and radiant.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.95 }}
              style={{ opacity: fadeOut }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center will-change-transform"
            >
              <Button asChild
                className="btn-luxury shine-on-hover bg-[#d4af37] hover:bg-[#b8941f] text-white font-semibold rounded-none h-[58px] px-14 text-[11px] tracking-[0.28em] uppercase border border-[#d4af37]/60 shadow-[0_0_40px_rgba(212,175,55,0.35)]"
              >
                <Link href="#appointment">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline"
                className="btn-luxury bg-white/[0.06] hover:bg-white/[0.12] text-white hover:text-white border border-white/30 hover:border-[#e5c158]/60 rounded-none h-[58px] px-14 text-[11px] tracking-[0.28em] uppercase backdrop-blur-sm transition-all duration-500"
              >
                <Link href="#services">Explore Menu</Link>
              </Button>
            </motion.div>

          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 pointer-events-none"
        >
          <span className="text-[8px] uppercase tracking-[0.45em] text-[#e5c158]/70 font-semibold">Scroll</span>
          <motion.div
            animate={{ scaleY: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="w-[1px] h-16 bg-gradient-to-b from-[#e5c158]/80 to-transparent origin-top"
          />
        </motion.div>

      </section>
    </>
  );
}
