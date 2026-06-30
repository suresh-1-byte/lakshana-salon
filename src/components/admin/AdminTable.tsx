'use client';

import { motion } from 'framer-motion';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="p-8 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(212,175,55,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.05)' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-[9px] uppercase tracking-[0.35em] font-bold text-[#d4af37] ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-white/30 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-[rgba(212,175,55,0.05)]' : 'hover:bg-white/[0.02]'
                  }`}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {columns.map(col => (
                    <td key={String(col.key)} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : <span className="text-white/70 text-sm">{String((row as any)[col.key] ?? '—')}</span>
                      }
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
