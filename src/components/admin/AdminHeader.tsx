'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/bookings/calendar': 'Booking Calendar',
  '/admin/customers': 'Customers',
  '/admin/billing': 'Billing',
  '/admin/services': 'Services',
  '/admin/gallery': 'Gallery',
  '/admin/reviews': 'Reviews',
  '/admin/notifications': 'Notifications',
  '/admin/coupons': 'Coupons',
  '/admin/reports': 'Reports',
  '/admin/activity': 'Activity Log',
  '/admin/settings': 'Settings',
};

export function AdminHeader() {
  const pathname = usePathname();
  const [time, setTime] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const title = PAGE_TITLES[pathname] || PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k + '/')) || ''] || 'Admin';

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className="h-[72px] flex items-center justify-between px-6 shrink-0"
      style={{
        background: 'rgba(13,10,20,0.95)',
        borderBottom: '1px solid rgba(212,68,122,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Page title */}
      <div>
        <h1 className="text-white font-light text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-medium mt-0.5">
          Lakshana Premier Beauty Salon
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-2 text-white/40">
          <Clock size={13} />
          <span className="text-[11px] font-medium tracking-wide">{time}</span>
        </div>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Search size={13} className="text-white/30" />
          <span className="text-white/40 text-xs">Search...</span>
          <kbd className="text-[10px] text-white/30 ml-2">Ctrl+K</kbd>
        </button>

        {/* Admin badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(212,68,122,0.12)', border: '1px solid rgba(212,68,122,0.2)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
            <User size={12} className="text-white" />
          </div>
          <span className="text-white/70 text-[11px] font-medium hidden sm:block">Admin</span>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
