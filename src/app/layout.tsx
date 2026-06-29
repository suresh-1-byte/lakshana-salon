import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/lib/cart-context';
import { PageLoader } from '@/components/PageLoader';
import { NotificationPrompt } from '@/components/NotificationPrompt';

export const metadata: Metadata = {
  title: "Lakshana Beauty Salon | Premium Women's Salon in Nolambur, Chennai",
  description:
    'Experience luxury beauty treatments at Lakshana Beauty Salon, Nolambur. Expert hair care, skin rituals, and personalized grooming for the modern woman.',
  icons: {
    icon: [
      { url: '/logo.png?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png?v=2',
    shortcut: '/logo.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Great+Vibes&family=Raleway:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-obsidian text-ivory overflow-x-hidden">
        {/* ── Luxury Page Loader ───────────────────────────── */}
        <PageLoader />

        <CartProvider>
          {children}
          <NotificationPrompt />
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
