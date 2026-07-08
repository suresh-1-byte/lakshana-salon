'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarCheck, Receipt, Image as ImageIcon,
  Scissors, Star, Bell, Tag, Settings, FileDown, LogOut,
  ChevronLeft, ChevronRight, Sparkles, ActivitySquare, Clipboard, Cake,
  CreditCard,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',                  label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/bookings',         label: 'Bookings',       icon: CalendarCheck },
  { href: '/admin/bookings/calendar',label: 'Calendar',       icon: Sparkles },
  { href: '/admin/customers',        label: 'Customers',      icon: Users },
  { href: '/admin/customer-packages', label: 'Customer Packages', icon: Tag },
  { href: '/admin/consultations',    label: 'Consultations',  icon: Clipboard },
  { href: '/admin/billing',          label: 'Billing',        icon: Receipt },
  { href: '/admin/membership',       label: 'Membership',     icon: CreditCard },
  { href: '/admin/services',         label: 'Services',       icon: Scissors },
  { href: '/admin/service-addons',   label: 'Add-ons',        icon: Sparkles },
  { href: '/admin/gallery',          label: 'Gallery',        icon: ImageIcon },
  { href: '/admin/reviews',          label: 'Reviews',        icon: Star },
  { href: '/admin/notifications',    label: 'Notifications',  icon: Bell },
  { href: '/admin/birthday-management', label: 'Birthday Management', icon: Cake },
  { href: '/admin/coupons',          label: 'Coupons',        icon: Tag },
  { href: '/admin/reports',          label: 'Reports',        icon: FileDown },
  { href: '/admin/activity',         label: 'Activity',       icon: ActivitySquare },
  { href: '/admin/settings',         label: 'Settings',       icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Prefetch all nav routes on mount so page switches are instant
  useEffect(() => {
    NAV_ITEMS.forEach(({ href }) => {
      router.prefetch(href);
    });
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen flex flex-col overflow-hidden relative z-10 shrink-0"
      style={{
        background: 'linear-gradient(180deg, #130D1E 0%, #0D0A14 100%)',
        borderRight: '1px solid rgba(212,68,122,0.12)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 p-4 pb-3 min-h-[72px]"
        style={{ borderBottom: '1px solid rgba(212,68,122,0.1)' }}>
        <div className="relative w-10 h-10 shrink-0"
          style={{ background: '#1A0D15', borderRadius: '50%', boxShadow: '0 0 20px rgba(212,68,122,0.25)' }}>
          <Image src="/logo.png" alt="Logo" fill className="object-contain rounded-full p-1"
            style={{ mixBlendMode: 'screen', filter: 'brightness(1.9) saturate(2.2)' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-white font-light text-[13px] whitespace-nowrap leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Lakshana Beauty
              </p>
              <p className="text-[#D4447A] text-[8px] tracking-[0.35em] uppercase font-bold">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(212,68,122,0.2), rgba(176,48,96,0.12))',
                border: '1px solid rgba(212,68,122,0.25)',
                boxShadow: '0 4px 16px rgba(212,68,122,0.1)',
              } : {}}
              title={collapsed ? label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: '#D4447A' }}
                />
              )}
              <Icon size={17} className={`shrink-0 ${active ? 'text-[#D4447A]' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[12px] font-medium whitespace-nowrap"
                    style={{ fontFamily: "'Raleway', sans-serif", letterSpacing: '0.04em' }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 pb-4" style={{ borderTop: '1px solid rgba(212,68,122,0.1)' }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[12px] font-medium whitespace-nowrap"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[76px] w-6 h-6 rounded-full flex items-center justify-center text-[#D4447A] z-20 transition-all duration-200 hover:scale-110"
        style={{
          background: '#130D1E',
          border: '1px solid rgba(212,68,122,0.3)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
