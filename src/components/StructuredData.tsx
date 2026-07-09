'use client';

/**
 * StructuredData Component
 * Renders JSON-LD structured data for better SEO
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Review Schema Component
 */
interface ReviewSchemaProps {
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

export function ReviewSchema({ reviews }: ReviewSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: reviews.map((review, index) => ({
      '@type': 'Review',
      position: index + 1,
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.text,
      datePublished: review.date
    }))
  };

  return <StructuredData data={schema} />;
}
