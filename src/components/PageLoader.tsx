'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    // Start fade-out after 2s
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    // Remove from DOM after fade completes (0.8s transition)
    const hideTimer = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#07050A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* ── Full brand logo (pink LP Beauty Salon) ── */}
      <div
        style={{
          position: 'relative',
          width: 'min(280px, 60vw)',
          height: 'min(280px, 60vw)',
          flexShrink: 0,
          animation: 'loader-logo-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))',
        }}
      >
        <Image
          src="/logoentrance.jpeg"
          alt="Lakshana Beauty Salon"
          fill
          sizes="280px"
          className="object-contain"
          style={{
            mixBlendMode: 'lighten',
            filter: 'brightness(1.1) contrast(1.2)',
          }}
          priority
        />
      </div>

      {/* ── Pink loading animation ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        animation: 'loader-logo-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>

        {/* Animated pink bar */}
        <div style={{
          width: '160px',
          height: '1px',
          background: 'rgba(212,175,55,0.15)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1px',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #d4af37, #e5c158, #d4af37, transparent)',
            animation: 'loader-bar-sweep 1.6s ease-in-out infinite',
            width: '60%',
          }} />
        </div>

        {/* Dot trio */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#d4af37',
                animation: `loader-dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loader-logo-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes loader-bar-sweep {
          0%   { left: -60%; }
          100% { left: 160%; }
        }
        @keyframes loader-dot-pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.35; }
          40%            { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px rgba(212,175,55,0.7); }
        }
      `}</style>
    </div>
  );
}
