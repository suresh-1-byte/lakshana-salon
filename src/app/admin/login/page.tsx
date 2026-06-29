'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0A14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,68,122,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(176,48,96,0.3) 0%, transparent 70%)', filter: 'blur(100px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,240,245,0.03) 100%)',
            border: '1px solid rgba(212,68,122,0.2)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.5), 0 0 60px rgba(212,68,122,0.1)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Top gradient bar */}
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #D4447A, #E8A0B4, #D4447A)' }} />

          <div className="p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative w-16 h-16 mb-4"
                style={{ background: '#1A0D15', borderRadius: '50%', boxShadow: '0 0 30px rgba(212,68,122,0.3)' }}>
                <Image src="/logo.png" alt="Logo" fill className="object-contain rounded-full p-1"
                  style={{ mixBlendMode: 'screen', filter: 'brightness(1.9) saturate(2.2)' }} />
              </div>
              <h1 className="text-white font-light text-2xl tracking-wider" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Lakshana Beauty
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles size={10} className="text-[#D4447A]" />
                <span className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">Admin Portal</span>
                <Sparkles size={10} className="text-[#D4447A]" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89BAA]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full h-12 bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-white/30 text-sm outline-none transition-all duration-300 focus:border-[rgba(212,68,122,0.5)] focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89BAA]" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-12 text-white placeholder:text-white/30 text-sm outline-none transition-all duration-300 focus:border-[rgba(212,68,122,0.5)] focus:bg-white/[0.08]"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B89BAA] hover:text-white transition-colors">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-400 disabled:opacity-50 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 30px rgba(212,68,122,0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-white/20 text-xs mt-8">
              Lakshana Premier Beauty Salon — Admin Panel v1.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
