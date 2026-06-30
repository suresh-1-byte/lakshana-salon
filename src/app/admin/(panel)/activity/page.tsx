'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, RefreshCw, Clock } from 'lucide-react';
import type { ActivityLog } from '@/types/admin';

const ACTION_COLORS: Record<string, string> = {
  admin_login:       '#22C55E',
  customer_create:   '#d4af37',
  customer_update:   '#e5c158',
  customer_delete:   '#EF4444',
  billing_create:    '#D4AF37',
  gallery_add:       '#818CF8',
  gallery_delete:    '#EF4444',
  service_create:    '#d4af37',
  service_update:    '#e5c158',
  service_delete:    '#EF4444',
  notification_sent: '#22C55E',
  coupon_create:     '#D4AF37',
  review_update:     '#818CF8',
  review_delete:     '#EF4444',
  settings_update:   '#94A3B8',
  password_change:   '#EAB308',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/activity');
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch {
      // Fallback silently
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={fetchLogs}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
          <RefreshCw size={13} />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <ActivitySquare size={40} className="mx-auto mb-4 opacity-30" />
          <p>No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, i) => {
            const color = ACTION_COLORS[log.action] || '#94A3B8';
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <ActivitySquare size={15} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: `${color}18`, color }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-white/25 text-[11px] flex items-center gap-1">
                      <Clock size={9} />
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
