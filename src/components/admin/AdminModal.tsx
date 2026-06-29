'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function AdminModal({ open, onClose, title, children, size = 'md' }: AdminModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none`}
          >
            <div
              className={`pointer-events-auto w-full ${sizeMap[size]} rounded-2xl overflow-hidden max-h-[90vh] flex flex-col`}
              style={{
                background: 'linear-gradient(145deg, #1A1025 0%, #130D1E 100%)',
                border: '1px solid rgba(212,68,122,0.2)',
                boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(212,68,122,0.1)',
              }}
            >
              {/* Top bar */}
              <div className="h-[2px] shrink-0" style={{ background: 'linear-gradient(90deg, #D4447A, #E8A0B4, #D4447A)' }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid rgba(212,68,122,0.1)' }}>
                <h2 className="text-white font-light text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
