'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminPageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prev, setPrev] = useState(pathname);

  useEffect(() => {
    if (pathname !== prev) {
      setLoading(true);
      setPrev(pathname);
      // Hide after short delay — page has loaded by then
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [pathname, prev]);

  return (
    <AnimatePresence>
      {loading && (
        <>
          {/* Top progress bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[999] h-[2px] origin-left"
            style={{ background: 'linear-gradient(90deg, #D4447A, #E8A0B4, #D4447A)' }}
          />
          {/* Subtle page overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[50] pointer-events-none"
            style={{ background: 'rgba(13,10,20,0.3)' }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
