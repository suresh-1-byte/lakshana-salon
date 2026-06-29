export interface ServiceItem {
  name: string;
  nonMember: string;
  member: string;
  duration: string;
  note?: string;
  subItems?: { label: string; nonMember: string; member: string }[];
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;          // emoji icon
  accent: string;        // tailwind bg color token
  services: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'threading',
    title: 'Threading',
    description: 'Professional threading services with precise shaping and finishing.',
    icon: '✦',
    accent: '#D4447A',
    services: [
      { name: 'Eyebrow', nonMember: '₹50', member: '₹50', duration: '10 min' },
      { name: 'Upper Lip / Lower Lip / Chin', nonMember: '₹50', member: '₹50', duration: '10 min' },
      { name: 'Face Threading', nonMember: '₹400', member: '₹400', duration: '10 min' },
    ],
  },
  {
    id: 'haircut',
    title: 'Hair Cut',
    description: 'Precision cuts crafted to complement your face shape and personal style.',
    icon: '✂',
    accent: '#C2185B',
    services: [
      { name: 'Classic Cut', nonMember: '₹450', member: '₹350', duration: '20 min' },
      { name: 'Straight / U Cut', nonMember: '₹600', member: '₹500', duration: '30 min' },
      { name: 'Creative Hair Cut', nonMember: '₹1,000', member: '₹900', duration: '1 hr' },
      { name: 'Fringe / Bangs', nonMember: '₹250', member: '₹200', duration: '15 min' },
    ],
  },
  {
    id: 'ironing',
    title: 'Ironing / Temporary Straightening',
    description: 'Instant silky-smooth straightening for a sleek, polished finish.',
    icon: '〰',
    accent: '#AD1457',
    services: [
      { name: 'Short Hair Length', nonMember: '₹700', member: '₹600', duration: '1 hr' },
      { name: 'Medium Hair Length', nonMember: '₹850', member: '₹750', duration: '1 hr' },
      { name: 'Long Hair Length', nonMember: '₹1,000', member: '₹950', duration: '1 hr' },
    ],
  },
  {
    id: 'shampoo',
    title: 'Shampoo + Conditioning + Blow Dry',
    description: 'Revitalising cleanse and professional blow-dry styling.',
    icon: '◈',
    accent: '#E91E8C',
    services: [
      { name: 'Hair Wash Blast Dry (Medium)', nonMember: '₹500', member: '₹450', duration: '25 min' },
      { name: 'Hair Wash Blast Dry (Long)', nonMember: '₹600', member: '₹550', duration: '25 min' },
      { name: 'Hair Wash & Blow Dry Setting (Medium)', nonMember: '₹1,000', member: '₹900', duration: '25 min' },
      { name: 'Hair Wash & Blow Dry Setting (Long)', nonMember: '₹1,200', member: '₹1,000', duration: '25 min' },
    ],
  },
  {
    id: 'head-massage',
    title: 'Head Massage',
    description: 'Deeply relaxing scalp massages to relieve tension and nourish roots.',
    icon: '❋',
    accent: '#D4447A',
    services: [
      { name: 'Single Oil Head Massage', nonMember: '₹600', member: '₹500', duration: '30 min' },
      { name: 'Multi Oil Head Massage', nonMember: '₹800', member: '₹750', duration: '30 min' },
      { name: 'Head Massage With Hair Wash', nonMember: '₹1,100', member: '₹1,000', duration: '30 min' },
    ],
  },
  {
    id: 'hair-spa',
    title: 'Premium Hair Spa',
    description: 'Intensive repair and hydration rituals tailored to your hair type.',
    icon: '✿',
    accent: '#C2185B',
    services: [
      { name: 'Moisturizing Hair Spa', nonMember: '₹1,000', member: '₹900', duration: '45 min' },
      { name: 'Colour Protect Hair Spa', nonMember: '₹1,200', member: '₹1,000', duration: '45 min' },
      { name: 'Frizz Control Hair Spa', nonMember: '₹1,300', member: '₹1,200', duration: '45 min' },
      { name: 'Anti Hair Fall Hair Spa', nonMember: '₹1,500', member: '₹1,350', duration: '45 min' },
      { name: 'Anti Dandruff Hair Spa', nonMember: '₹1,700', member: '₹1,500', duration: '45 min' },
      { name: 'Intense Hydrating Hair Spa', nonMember: '₹2,200', member: '₹2,100', duration: '1 hr 15 min', note: 'Luxury' },
      { name: 'Smoothening Restore Hair Spa', nonMember: '₹2,500', member: '₹2,350', duration: '1 hr 15 min', note: 'Luxury' },
      { name: 'Moroccan Moisture Soft Hair Spa', nonMember: '₹3,000', member: '₹2,800', duration: '1 hr 15 min', note: 'Luxury' },
    ],
  },
  {
    id: 'advanced-hair',
    title: 'Advanced Hair Treatment',
    description: 'Targeted clinical treatments to address hair and scalp concerns.',
    icon: '⚕',
    accent: '#AD1457',
    services: [
      { name: 'Dandruff Treatment', nonMember: '₹1,500', member: '₹1,300', duration: '30 min' },
      { name: 'Dandruff Clear Treatment Spa', nonMember: '₹3,500', member: '₹3,300', duration: '30 min' },
      { name: 'Hair Fall Control', nonMember: '₹3,500', member: '₹3,300', duration: '30 min' },
      { name: 'Over Damaged Dry Hair Spa', nonMember: '₹3,800', member: '₹3,500', duration: '30 min' },
    ],
  },
  {
    id: 'hair-colour',
    title: 'Hair Colouring',
    description: 'Vibrant, long-lasting colour from root touch-ups to full global transformations.',
    icon: '◉',
    accent: '#E91E8C',
    services: [
      { name: 'Per Streak', nonMember: '₹300', member: '₹250', duration: '1 hr 15 min' },
      { name: 'Per Streak (Ammonia Free)', nonMember: '₹350', member: '₹300', duration: '2 hr 15 min' },
      { name: 'Root Touch', nonMember: '₹1,600', member: '₹1,400', duration: '1 hr 30 min' },
      { name: 'Root Touch (Ammonia Free)', nonMember: '₹1,800', member: '₹1,600', duration: '1 hr 30 min' },
      {
        name: 'Global Hair Colour (Ammonia Free)',
        nonMember: '₹3,500–₹4,000',
        member: '₹3,200–₹4,800',
        duration: '2 hr+',
        note: 'Medium / Long',
      },
      {
        name: 'Fashion Colour',
        nonMember: '₹4,500–₹5,500',
        member: '₹4,300–₹5,300',
        duration: '2 hr+',
        note: 'Medium / Long',
      },
    ],
  },
  {
    id: 'texture',
    title: 'Hair Texture Treatment',
    description: 'Permanent smoothening and transformation treatments for frizz-free, glossy hair.',
    icon: '❦',
    accent: '#D4447A',
    services: [
      {
        name: 'Smoothening / Straightening',
        nonMember: '₹3,000–₹5,500',
        member: '₹2,800–₹5,300',
        duration: '3 hr',
        note: 'Short / Medium / Long',
      },
      {
        name: 'Keratin',
        nonMember: '₹4,000–₹6,000',
        member: '₹3,800–₹5,800',
        duration: '3 hr',
        note: 'Short / Medium / Long',
      },
      {
        name: 'Botox',
        nonMember: '₹6,000–₹8,000',
        member: '₹5,800–₹7,800',
        duration: '3 hr',
        note: 'Short / Medium / Long',
      },
      {
        name: 'Nano Plastic',
        nonMember: '₹7,000–₹9,000',
        member: '₹6,800–₹8,800',
        duration: '3 hr',
        note: 'Short / Medium / Long',
      },
    ],
  },
  {
    id: 'detan',
    title: 'De-Tan',
    description: 'Brightening treatments to remove tan and restore natural skin radiance.',
    icon: '☀',
    accent: '#C2185B',
    services: [
      { name: 'Face Only', nonMember: '₹400', member: '₹350', duration: '15 min' },
      { name: 'Face & Neck', nonMember: '₹600', member: '₹550', duration: '15 min' },
      { name: 'Blouse Line', nonMember: '₹400', member: '₹350', duration: '20 min' },
      { name: 'Full Arm', nonMember: '₹700', member: '₹600', duration: '20 min' },
      { name: 'Full Leg', nonMember: '₹900', member: '₹800', duration: '25 min' },
      { name: 'Full Body', nonMember: '₹3,000', member: '₹2,800', duration: '20 min' },
    ],
  },
  {
    id: 'facial',
    title: 'Cleanup + Facials',
    description: 'Signature facials for deep cleansing, hydration, and luminous glow.',
    icon: '✾',
    accent: '#AD1457',
    services: [
      { name: 'Face Massage', nonMember: '₹500', member: '₹500', duration: '30 min' },
      { name: 'Express Cleanup', nonMember: '₹800', member: '₹750', duration: '20 min' },
      { name: 'Organic Cleanup', nonMember: '₹1,000', member: '₹950', duration: '35 min' },
    ],
  },
  {
    id: 'hydra-facial',
    title: 'Hydra Facial',
    description: 'Medical-grade hydradermabrasion for visibly refreshed, glowing skin.',
    icon: '◆',
    accent: '#E91E8C',
    services: [
      { name: 'Dermaplaning', nonMember: '₹3,500', member: '₹3,300', duration: '45 min' },
      { name: 'Microdermabrasion & Brightening Peel', nonMember: '₹4,500', member: '₹4,300', duration: '50 min' },
      { name: 'Signature Hydra Therapy', nonMember: '₹5,500', member: '₹5,300', duration: '60 min' },
      { name: 'Deluxe Hydra Facial', nonMember: '₹6,000', member: '₹5,800', duration: '75 min' },
      { name: 'Platinum Hydra Facial', nonMember: '₹6,500', member: '₹6,300', duration: '90 min' },
    ],
  },
  {
    id: 'waxing',
    title: 'Waxing',
    description: 'Smooth, long-lasting hair removal with gentle precision.',
    icon: '✦',
    accent: '#D4447A',
    services: [
      { name: 'Upper Lip / Lower Lip / Chin', nonMember: '₹250', member: '₹200', duration: '10 min' },
      { name: 'Side Chin', nonMember: '₹300', member: '₹250', duration: '10 min' },
      { name: 'Full Face', nonMember: '₹600', member: '₹500', duration: '20 min' },
      { name: 'Underarm', nonMember: '₹300', member: '₹250', duration: '10 min' },
      { name: 'Half Hand', nonMember: '₹500', member: '₹450', duration: '15 min' },
      { name: 'Half Leg', nonMember: '₹700', member: '₹650', duration: '20 min' },
      { name: 'Full Arm', nonMember: '₹700', member: '₹650', duration: '20 min' },
      { name: 'Full Leg', nonMember: '₹900', member: '₹850', duration: '25 min' },
      { name: 'Neck Front / Back', nonMember: '₹1,500', member: '₹1,400', duration: '15 min' },
      { name: 'Abdomen', nonMember: '₹1,300', member: '₹1,200', duration: '20 min' },
      { name: 'Bikini Wax', nonMember: '₹2,500', member: '₹2,300', duration: '30 min' },
      { name: 'Full Body Wax', nonMember: '₹4,000', member: '₹3,800', duration: '90 min' },
    ],
  },
  {
    id: 'body-polish',
    title: 'Body Polishing with Steam',
    description: 'Luxurious full-body exfoliation with steam for radiant, velvety-smooth skin.',
    icon: '✿',
    accent: '#C2185B',
    services: [
      { name: 'Choco Glow Body Polish', nonMember: '₹5,000', member: '₹4,800', duration: '1 hr 30 min' },
      { name: 'Lemon Walnut Body Polish', nonMember: '₹5,500', member: '₹5,300', duration: '1 hr 30 min' },
      { name: 'Wine Bright Glow Body Polish', nonMember: '₹6,000', member: '₹5,700', duration: '1 hr 30 min' },
      { name: 'Coconut Body Polish', nonMember: '₹6,200', member: '₹6,000', duration: '1 hr 30 min' },
    ],
  },
  {
    id: 'pedicure',
    title: 'Pedicure & Manicure',
    description: 'Indulgent nail and foot care rituals for perfectly pampered hands and feet.',
    icon: '◈',
    accent: '#AD1457',
    services: [
      { name: 'Express Pedi/Manicure', nonMember: '₹1,000', member: '₹1,000', duration: '40 min' },
      { name: 'Aromatic Pedi/Manicure', nonMember: '₹900', member: '₹800', duration: '30 min' },
      { name: 'Coffee Pedi/Manicure', nonMember: '₹1,200', member: '₹1,100', duration: '40 min' },
      { name: 'Wine Pedi/Manicure', nonMember: '₹1,300', member: '₹1,200', duration: '45 min' },
      { name: 'Lemon Walnut Pedi/Manicure', nonMember: '₹1,500', member: '₹1,400', duration: '45 min' },
    ],
  },
];
