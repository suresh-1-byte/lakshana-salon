'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarCheck, Receipt, Bell, Star, Scissors,
  TrendingUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface DashboardData {
  stats: {
    totalCustomers: number;
    todayCustomers: number;
    monthlyCustomers: number;
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
    notificationsSent: number;
    newReviews: number;
    activeServices: number;
  };
  revenueChart: { date: string; revenue: number }[];
  bookingChart: { month: string; bookings: number }[];
  popularServices: { name: string; count: number }[];
}

const CHART_COLORS = ['#d4af37', '#e5c158', '#b8941f', '#4a5f7f', '#AD1457'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  const statCards = [
    { title: 'Total Customers',   value: s?.totalCustomers ?? 0,   subtitle: `${s?.monthlyCustomers ?? 0} this month`, icon: Users,          color: '#d4af37' },
    { title: "Today's Customers", value: s?.todayCustomers ?? 0,   subtitle: 'Visits today',                           icon: Users,          color: '#e5c158' },
    { title: 'Total Bookings',    value: s?.totalBookings ?? 0,    subtitle: `${s?.pendingBookings ?? 0} pending`,     icon: CalendarCheck,  color: '#b8941f' },
    { title: 'Completed',         value: s?.completedBookings ?? 0,subtitle: 'Services done',                          icon: CheckCircle,    color: '#4a5f7f' },
    { title: "Today's Revenue",   value: `₹${(s?.todayRevenue ?? 0).toLocaleString('en-IN')}`, subtitle: 'Cash + Card + UPI', icon: TrendingUp, color: '#d4af37' },
    { title: 'Monthly Revenue',   value: `₹${(s?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`, subtitle: 'This month',  icon: Receipt,       color: '#e5c158' },
    { title: 'Total Revenue',     value: `₹${(s?.totalRevenue ?? 0).toLocaleString('en-IN')}`,   subtitle: 'All time',    icon: Receipt,       color: '#b8941f' },
    { title: 'Pending Reviews',   value: s?.newReviews ?? 0,       subtitle: 'Need approval',                          icon: Star,           color: '#4a5f7f' },
    { title: 'Notifications',     value: s?.notificationsSent ?? 0,subtitle: 'Sent total',                             icon: Bell,           color: '#AD1457' },
    { title: 'Active Services',   value: s?.activeServices ?? 0,   subtitle: 'In menu',                                icon: Scissors,       color: '#d4af37' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(184,148,31,0.08) 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[120px] opacity-5 pointer-events-none select-none"
          style={{ fontFamily: "'Great Vibes', cursive", color: '#d4af37' }}>
          Lakshana
        </div>
        <div className="relative">
          <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-bold mb-1">Welcome back</p>
          <h2 className="text-white text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Lakshana Premier Beauty Salon
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(212,175,55,0.12)',
          }}
        >
          <div className="mb-4">
            <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold">Revenue Trend</p>
            <p className="text-white text-lg font-light mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Last 7 Days
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueChart || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  background: '#1A1025', border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '12px', color: 'white', fontSize: '12px',
                }}
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2}
                fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Popular Services Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(212,175,55,0.12)',
          }}
        >
          <div className="mb-4">
            <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold">Popular</p>
            <p className="text-white text-lg font-light mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Top Services
            </p>
          </div>
          {(data?.popularServices?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.popularServices || []}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="count"
                  paddingAngle={3}
                >
                  {(data?.popularServices || []).map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1025', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/25 text-sm">
              No billing data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Bookings Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <div className="mb-4">
          <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold">Appointments</p>
          <p className="text-white text-lg font-light mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Monthly Bookings — Last 6 Months
          </p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.bookingChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1A1025', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontSize: '12px' }}
            />
            <Bar dataKey="bookings" fill="#d4af37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <p className="text-[#d4af37] text-[9px] tracking-[0.4em] uppercase font-bold mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Booking',      href: '/admin/bookings',      icon: CalendarCheck, color: '#d4af37' },
            { label: 'Add Customer',     href: '/admin/customers',     icon: Users,         color: '#e5c158' },
            { label: 'Create Bill',      href: '/admin/billing',       icon: Receipt,       color: '#b8941f' },
            { label: 'Send Notification',href: '/admin/notifications', icon: Bell,          color: '#4a5f7f' },
          ].map(action => (
            <a key={action.label} href={action.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
              style={{
                background: `${action.color}12`,
                border: `1px solid ${action.color}25`,
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${action.color}20` }}>
                <action.icon size={16} style={{ color: action.color }} />
              </div>
              <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
