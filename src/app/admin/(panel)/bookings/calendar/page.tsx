'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Booking } from '@/types/admin';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bookings').then(r => r.json()).then(d => {
      if (d.bookings) setBookings(d.bookings);
    });
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const bookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (b.scheduledDate) return b.scheduledDate.startsWith(dateStr);
      // Fall back to createdAt date
      return b.createdAt?.startsWith(dateStr);
    });
  };

  const selectedBookings = selectedDate
    ? bookings.filter(b => {
        if (b.scheduledDate) return b.scheduledDate.startsWith(selectedDate);
        return b.createdAt?.startsWith(selectedDate);
      })
    : [];

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.12)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-5"
            style={{ borderBottom: '1px solid rgba(212,68,122,0.1)' }}>
            <button onClick={prevMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-white font-light text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-4 pt-4">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-[0.25em] font-bold text-white/25 pb-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayBookings = bookingsForDay(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selectedDate === dateStr;

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200"
                  style={
                    isSelected
                      ? { background: 'rgba(212,68,122,0.25)', border: '1px solid rgba(212,68,122,0.5)' }
                      : isToday
                        ? { background: 'rgba(212,68,122,0.1)', border: '1px solid rgba(212,68,122,0.25)' }
                        : { border: '1px solid transparent' }
                  }
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-[#D4447A]' : isSelected ? 'text-white' : 'text-white/60'}`}>
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayBookings.slice(0, 3).map((b, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: b.status === 'confirmed' ? '#22C55E'
                              : b.status === 'completed' ? '#818CF8'
                              : b.status === 'cancelled' ? '#EF4444'
                              : '#EAB308'
                          }} />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[8px] text-white/30">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-5 pb-5">
            {[
              { color: '#EAB308', label: 'Pending' },
              { color: '#22C55E', label: 'Confirmed' },
              { color: '#818CF8', label: 'Completed' },
              { color: '#EF4444', label: 'Cancelled' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-white/30 text-[11px]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day bookings */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.12)' }}>
          <div className="p-5" style={{ borderBottom: '1px solid rgba(212,68,122,0.1)' }}>
            <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold mb-1">
              {selectedDate ? 'Bookings for' : 'Select a Day'}
            </p>
            {selectedDate && (
              <p className="text-white font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
            {!selectedDate && (
              <div className="text-center py-12 text-white/25">
                <CalIcon size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click a date to view bookings</p>
              </div>
            )}
            {selectedDate && selectedBookings.length === 0 && (
              <div className="text-center py-12 text-white/25">
                <p className="text-sm">No bookings on this day</p>
              </div>
            )}
            {selectedBookings.map(b => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white text-sm font-medium">{b.name}</p>
                    <p className="text-white/40 text-[11px]">{b.phone}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="space-y-1">
                  {b.services?.slice(0, 2).map((s, i) => (
                    <p key={i} className="text-white/50 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#D4447A] inline-block" />
                      {s.name}
                    </p>
                  ))}
                  {(b.services?.length ?? 0) > 2 && (
                    <p className="text-white/30 text-[10px]">+{(b.services?.length ?? 0) - 2} more</p>
                  )}
                </div>
                {b.scheduledTime && (
                  <p className="text-[#D4447A] text-[11px] mt-2 flex items-center gap-1">
                    <CalIcon size={10} /> {b.scheduledTime}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
