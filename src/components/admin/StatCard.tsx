'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
  index?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = '#d4af37', trend, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${color}22`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${color}08`,
        transition: 'all 0.4s ease',
      }}
    >
      {/* Gradient top bar */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}80, transparent)` }} />

      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 80% at 80% 0%, ${color}10 0%, transparent 60%)` }} />

      <div className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          {trend !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            }`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.35em] font-bold mb-1">{title}</p>
        <p className="text-white text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {value}
        </p>
        {subtitle && <p className="text-white/30 text-[11px] mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
