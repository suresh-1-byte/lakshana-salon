'use client';

import { forwardRef } from 'react';

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 ${
            error
              ? 'border-red-500/50 bg-red-500/5 focus:border-red-400/70'
              : 'border-white/10 bg-white/[0.05] focus:border-[rgba(212,68,122,0.45)] focus:bg-white/[0.07]'
          } border ${className}`}
          style={{ fontFamily: "'Raleway', sans-serif" }}
          {...props}
        />
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        {hint && !error && <p className="text-white/25 text-[11px]">{hint}</p>}
      </div>
    );
  }
);
AdminInput.displayName = 'AdminInput';

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function AdminSelect({ label, error, options, className = '', ...props }: AdminSelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">
          {label}
        </label>
      )}
      <select
        className={`w-full h-11 rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 border border-white/10 bg-white/[0.05] focus:border-[rgba(212,68,122,0.45)] focus:bg-white/[0.07] cursor-pointer ${className}`}
        style={{ fontFamily: "'Raleway', sans-serif", background: '#1A1025' }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#1A1025' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function AdminTextarea({ label, error, className = '', ...props }: AdminTextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 border border-white/10 bg-white/[0.05] focus:border-[rgba(212,68,122,0.45)] focus:bg-white/[0.07] resize-y min-h-[80px] ${className}`}
        style={{ fontFamily: "'Raleway', sans-serif" }}
        {...props}
      />
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}
