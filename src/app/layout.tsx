import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/lib/cart-context';
import { PageLoader } from '@/components/PageLoader';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { SITE_CONFIG } from '@/lib/seo-config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0D0A14' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.business.name }],
  creator: SITE_CONFIG.business.name,
  publisher: SITE_CONFIG.business.name,
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Premium Beauty Salon`,
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: '@lakshanasalon',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/logo.png?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png?v=2',
    shortcut: '/logo.png?v=2',
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // Alternate languages
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      'en-IN': SITE_CONFIG.url,
      'ta-IN': `${SITE_CONFIG.url}/ta`,
    },
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  // Category
  category: 'Beauty & Personal Care',
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
        
        {/* Structured Data - Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BeautySalon',
              '@id': SITE_CONFIG.url,
              name: SITE_CONFIG.business.name,
              description: SITE_CONFIG.description,
              url: SITE_CONFIG.url,
              logo: `${SITE_CONFIG.url}/logo.png`,
              image: `${SITE_CONFIG.url}/og-image.jpg`,
              telephone: SITE_CONFIG.business.phone,
              email: SITE_CONFIG.business.email,
              priceRange: SITE_CONFIG.business.priceRange,
              address: {
                '@type': 'PostalAddress',
                streetAddress: SITE_CONFIG.business.address.street,
                addressLocality: SITE_CONFIG.business.address.city,
                addressRegion: SITE_CONFIG.business.address.state,
                postalCode: SITE_CONFIG.business.address.postalCode,
                addressCountry: SITE_CONFIG.business.address.country
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: SITE_CONFIG.business.geo.latitude,
                longitude: SITE_CONFIG.business.geo.longitude
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '09:00',
                closes: '20:00'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: SITE_CONFIG.business.rating.toString(),
                reviewCount: SITE_CONFIG.business.reviewCount.toString()
              },
              sameAs: [
                SITE_CONFIG.social.instagram,
                SITE_CONFIG.social.facebook,
                SITE_CONFIG.social.youtube
              ]
            })
          }}
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
