/**
 * SEO Configuration for Lakshana Beauty Salon
 * Central configuration for all SEO-related metadata
 */

export const SITE_CONFIG = {
  name: 'Lakshana Beauty Salon',
  title: 'Lakshana Beauty Salon | Premium Women\'s Salon in Nolambur, Chennai',
  description: 'Experience luxury beauty treatments at Lakshana Beauty Salon in Nolambur, Chennai. Expert hair care, bridal makeup, skin treatments, nail art, spa services, and personalized grooming for the modern woman.',
  url: 'https://lakshana-salon.vercel.app',
  ogImage: 'https://lakshana-salon.vercel.app/og-image.jpg',
  keywords: [
    'beauty salon in Nolambur',
    'women salon Chennai',
    'hair salon Nolambur',
    'bridal makeup Chennai',
    'best salon in Nolambur',
    'hair spa Chennai',
    'nail art salon',
    'skin treatment salon',
    'facial spa Nolambur',
    'keratin treatment Chennai',
    'hair coloring salon',
    'beauty parlour Nolambur',
    'luxury salon Chennai',
    'professional makeup artist',
    'wedding makeup Chennai'
  ],
  
  // Business Information
  business: {
    name: 'Lakshana Beauty Salon',
    legalName: 'Lakshana Premier Beauty Salon',
    address: {
      street: 'Nolambur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600095',
      country: 'India'
    },
    geo: {
      latitude: 13.0827,  // Update with actual coordinates
      longitude: 80.2707
    },
    phone: '+91 9876543210',  // Update with actual phone
    email: 'info@lakshanasalon.com',
    priceRange: '₹₹',
    openingHours: [
      'Mo-Su 09:00-20:00'
    ],
    rating: 4.8,
    reviewCount: 150
  },
  
  // Services
  services: [
    'Hair Cutting & Styling',
    'Hair Coloring & Highlights',
    'Keratin Treatment',
    'Hair Spa & Deep Conditioning',
    'Bridal Makeup',
    'Party Makeup',
    'Facial Treatments',
    'Skin Care Treatments',
    'Manicure & Pedicure',
    'Nail Art',
    'Waxing Services',
    'Threading',
    'Body Spa',
    'Head Massage'
  ],
  
  // Social Media
  social: {
    instagram: 'https://instagram.com/lakshanasalon',
    facebook: 'https://facebook.com/lakshanasalon',
    youtube: 'https://youtube.com/@lakshanasalon',
    whatsapp: 'https://wa.me/919876543210'
  }
};

/**
 * Generate JSON-LD structured data for local business
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': SITE_CONFIG.url,
    name: SITE_CONFIG.business.name,
    legalName: SITE_CONFIG.business.legalName,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    image: [
      `${SITE_CONFIG.url}/og-image.jpg`,
      `${SITE_CONFIG.url}/salon-interior.jpg`,
      `${SITE_CONFIG.url}/services-preview.jpg`
    ],
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
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '09:00',
      closes: '20:00'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SITE_CONFIG.business.rating,
      reviewCount: SITE_CONFIG.business.reviewCount,
      bestRating: '5',
      worstRating: '1'
    },
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.youtube
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Beauty Services',
      itemListElement: SITE_CONFIG.services.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service
        }
      }))
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate service page schema
 */
export function generateServiceSchema(service: {
  name: string;
  description: string;
  price?: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'BeautySalon',
      name: SITE_CONFIG.business.name,
      url: SITE_CONFIG.url
    },
    areaServed: {
      '@type': 'City',
      name: 'Chennai'
    },
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'INR'
      }
    })
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}
