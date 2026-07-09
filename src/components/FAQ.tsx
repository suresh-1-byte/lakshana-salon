'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { generateFAQSchema } from '@/lib/seo-config';

const faqs = [
  {
    question: 'What services does Lakshana Beauty Salon offer?',
    answer: 'We offer a comprehensive range of beauty services including hair cutting & styling, hair coloring, keratin treatments, bridal makeup, party makeup, facials, skin treatments, manicure & pedicure, nail art, waxing, threading, body spa, and head massage.',
  },
  {
    question: 'Where is Lakshana Beauty Salon located in Chennai?',
    answer: 'Lakshana Beauty Salon is conveniently located in Nolambur, Chennai, Tamil Nadu. We serve customers from Nolambur, Mogappair, Ambattur, and surrounding areas.',
  },
  {
    question: 'What are the salon timings?',
    answer: 'We are open Monday to Sunday from 9:00 AM to 8:00 PM. We recommend booking an appointment in advance to ensure availability.',
  },
  {
    question: 'Do you offer bridal makeup packages?',
    answer: 'Yes! We specialize in bridal makeup and offer comprehensive bridal packages including pre-bridal treatments, makeup trial, HD bridal makeup, hairstyling, and saree draping. Our experienced makeup artists ensure you look stunning on your special day.',
  },
  {
    question: 'How can I book an appointment at Lakshana Salon?',
    answer: 'You can book an appointment through our website booking form, call us directly, or message us on WhatsApp. We recommend booking in advance, especially for bridal services and weekend appointments.',
  },
  {
    question: 'Do you use branded products?',
    answer: 'Yes, we use only premium, branded products from trusted international and Indian brands. All our products are genuine and suitable for different hair and skin types.',
  },
  {
    question: 'What is your pricing range?',
    answer: 'Our pricing is competitive and varies based on the service. We offer packages and membership options for regular customers. Please contact us or visit our salon for detailed pricing.',
  },
  {
    question: 'Do you offer membership or loyalty programs?',
    answer: 'Yes, we offer prepaid membership wallets that provide benefits like priority booking, special discounts, and exclusive offers. Ask our staff about our membership packages.',
  },
  {
    question: 'Is parking available at the salon?',
    answer: 'Yes, we have convenient parking facilities available for our customers.',
  },
  {
    question: 'Do you provide home service for bridal makeup?',
    answer: 'Yes, we offer home service for bridal makeup and special occasions. Additional charges apply based on location. Please contact us for more details.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-luxury-onyx to-[#1A0D15]">
      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-rose-gold" />
            <p className="text-rose-gold text-[10px] tracking-[0.4em] uppercase font-bold">
              Common Questions
            </p>
          </div>
          <h2
            className="text-white text-5xl md:text-6xl font-light mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to know about our services and salon
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-rose-gold/30 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="text-white text-lg font-medium pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-rose-gold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-white/70 text-base leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-white/70 mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-rose-gold to-[#B8936D] text-luxury-onyx font-semibold rounded-full hover:shadow-lg hover:shadow-rose-gold/30 transition-all duration-300"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
