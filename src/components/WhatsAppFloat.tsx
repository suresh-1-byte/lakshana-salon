'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919442977770'; // WhatsApp number without + or spaces
  const defaultMessage = 'Hi! I would like to book an appointment at Lakshana Beauty Salon.';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #25D366 0%, #128C7E 100%)',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)',
          }}
          aria-label="WhatsApp Chat"
        >
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Icon */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={28} className="text-white relative z-10" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle size={28} className="text-white relative z-10" fill="white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification badge */}
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-white text-[10px] font-bold">1</span>
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(37, 211, 102, 0.2)',
              }}
            >
              {/* Header */}
              <div
                className="p-4 flex items-center gap-3"
                style={{
                  background: 'linear-gradient(145deg, #25D366 0%, #128C7E 100%)',
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">Lakshana Salon</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                    <p className="text-white/90 text-sm">Online • Reply in minutes</p>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <p className="text-gray-700 text-sm leading-relaxed">
                    👋 Hi! Welcome to <strong>Lakshana Beauty Salon</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    How can we help you today?
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    📍 Nolambur, Chennai<br />
                    📞 +91 94429 77770<br />
                    🕐 Open Daily: 9 AM - 8 PM
                  </p>
                </motion.div>

                <p className="text-gray-400 text-xs text-center">
                  Click below to start chatting
                </p>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppClick}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(145deg, #25D366 0%, #128C7E 100%)',
                  }}
                >
                  <MessageCircle size={20} />
                  Start Chat on WhatsApp
                </motion.button>
              </div>

              {/* Footer */}
              <div className="px-4 pb-3">
                <p className="text-center text-[10px] text-gray-400">
                  Powered by WhatsApp Business
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
