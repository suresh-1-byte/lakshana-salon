'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  return (
    <header
      className="h-[72px] flex items-center justify-between px-6 shrink-0"
      style={{
        background: 'rgba(13,10,20,0.95)',
        borderBottom: '1px solid rgba(212,175,55,0.1)',
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
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={13} className="text-white/30" />
          <input placeholder="Search..." className="bg-transparent text-white/60 text-xs outline-none placeholder:text-white/25 w-32" />
        </div>

        {/* Admin badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
            <User size={12} className="text-white" />
          </div>
          <span className="text-white/70 text-[11px] font-medium hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
