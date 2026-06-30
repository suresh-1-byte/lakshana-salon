'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileDown, Calendar, TrendingUp, Users, Scissors,
  RefreshCw, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#D4447A', '#E8A0B4', '#B03060', '#7B4F62', '#AD1457'];

const EXPORT_TYPES = [
  { id: 'customers',    label: 'Customers',    icon: Users,      desc: 'All customer profiles with history' },
  { id: 'billing',      label: 'Billing',      icon: FileDown,   desc: 'All invoices with amounts' },
  { id: 'revenue',      label: 'Revenue',      icon: TrendingUp, desc: 'Daily revenue grouped by date' },
  { id: 'appointments', label: 'Appointments', icon: Calendar,   desc: 'All bookings with status' },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'revenue' | 'customers' | 'services'>('revenue');

  const [revenueData, setRevenueData]   = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [serviceData, setServiceData]   = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const [rev, cust, svc] = await Promise.all([
        fetch(`/api/admin/reports?type=revenue&from=${from}&to=${to}`).then(r => r.json()),
        fetch(`/api/admin/reports?type=customers&from=${from}&to=${to}`).then(r => r.json()),
        fetch(`/api/admin/reports?type=services`).then(r => r.json()),
      ]);
      if (rev.success)  setRevenueData(rev.data);
      if (cust.success) setCustomerData(cust.data);
      if (svc.success)  setServiceData(svc.data);
    } catch { /* ignore */ }
    setChartLoading(false);
  };

  useEffect(() => { fetchChartData(); }, [from, to]);

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      const params = new URLSearchParams({ type, from, to });
      const res = await fetch(`/api/admin/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lakshana-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `${type} report downloaded!` });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
    setExporting(null);
  };

  const tooltipStyle = {
    background: '#1A1025',
    border: '1px solid rgba(212,68,122,0.3)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
  };

  return (
    <div className="space-y-8">

      {/* Date range + refresh */}
      <div className="flex flex-wrap items-end gap-4 p-5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.12)' }}>
        <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold w-full mb-1">Date Range</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <p className="text-white/30 text-[9px] uppercase tracking-[0.3em]">From</p>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="h-9 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.4)]" />
          </div>
          <div className="space-y-1">
            <p className="text-white/30 text-[9px] uppercase tracking-[0.3em]">To</p>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="h-9 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.4)]" />
          </div>
          <button onClick={fetchChartData}
            className="h-9 w-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/10 transition-all self-end">
            <RefreshCw size={13} className={chartLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Summary stats */}
        {revenueData && (
          <div className="flex gap-6 ml-auto flex-wrap">
            {[
              { label: 'Total Revenue',  value: `₹${(revenueData.totalRevenue || 0).toLocaleString('en-IN')}`,  color: '#D4447A' },
              { label: 'Avg / Day',      value: `₹${(revenueData.avgPerDay || 0).toLocaleString('en-IN')}`,      color: '#E8A0B4' },
              { label: 'Transactions',   value: revenueData.billCount || 0,                                       color: '#B03060' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-light text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.25em]">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart tabs */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.12)' }}>
        <div className="flex items-center gap-2 p-4 border-b border-white/[0.05]">
          {[
            { id: 'revenue',   label: 'Revenue',          icon: TrendingUp },
            { id: 'customers', label: 'Customer Growth',  icon: Users },
            { id: 'services',  label: 'Top Services',     icon: Scissors },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveChart(tab.id as any)}
              className="flex items-center gap-2 px-4 h-8 rounded-lg text-xs font-medium transition-all"
              style={activeChart === tab.id
                ? { background: 'rgba(212,68,122,0.2)', color: '#D4447A' }
                : { color: 'rgba(255,255,255,0.4)' }
              }>
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#D4447A] border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {/* Revenue Area Chart */}
              {activeChart === 'revenue' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={revenueData?.chart || []}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#D4447A" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#D4447A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                        tickFormatter={v => v.slice(5)} />
                      <YAxis stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                        tickFormatter={v => `₹${v}`} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4447A" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  {/* Payment breakdown */}
                  {revenueData?.paymentBreakdown && (
                    <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] w-full">Payment Methods</p>
                      {Object.entries(revenueData.paymentBreakdown).map(([method, amount]: any) => (
                        <div key={method} className="px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.15)' }}>
                          <p className="text-[#D4447A] text-sm font-medium">₹{amount.toLocaleString('en-IN')}</p>
                          <p className="text-white/30 text-[10px] capitalize">{method}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Customer Growth Bar */}
              {activeChart === 'customers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={customerData?.chart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                      <YAxis stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#D4447A" radius={[4, 4, 0, 0]} name="New Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Loyalty breakdown */}
                  {customerData?.loyaltyBreakdown && (
                    <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] w-full">Loyalty Distribution (All Time)</p>
                      {Object.entries(customerData.loyaltyBreakdown).map(([tier, count]: any) => (
                        <div key={tier} className="px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-white text-sm font-medium">{count}</p>
                          <p className="text-white/30 text-[10px]">{tier}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Top Services */}
              {activeChart === 'services' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {(serviceData?.ranked || []).map((s: any, i: number) => (
                    <div key={s.name} className="flex items-center gap-4">
                      <span className="text-white/20 text-sm w-5 text-right shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white/70 text-sm">{s.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[#D4447A] text-sm font-medium">₹{(s.revenue || 0).toLocaleString('en-IN')}</span>
                            <span className="text-white/30 text-xs">{s.count} times</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (s.count / (serviceData?.ranked?.[0]?.count || 1)) * 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.06 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!serviceData?.ranked?.length) && (
                    <p className="text-white/25 text-sm text-center py-8">No billing data yet</p>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Export section */}
      <div>
        <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold mb-4">
          <FileDown size={11} className="inline mr-1.5" /> Export Reports
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPORT_TYPES.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(212,68,122,0.12)' }}>
                <r.icon size={18} className="text-[#D4447A]" />
              </div>
              <p className="text-white text-sm font-medium mb-1">{r.label}</p>
              <p className="text-white/30 text-xs mb-4 leading-relaxed">{r.desc}</p>
              <button onClick={() => handleExport(r.id)} disabled={exporting === r.id}
                className="w-full h-9 rounded-xl text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'rgba(212,68,122,0.15)', border: '1px solid rgba(212,68,122,0.25)', color: '#D4447A' }}>
                <FileDown size={12} />
                {exporting === r.id ? 'Generating...' : 'Export Excel'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
