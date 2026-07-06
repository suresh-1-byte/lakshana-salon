// ═══════════════════════════════════════════════════════
//  Admin Panel — Shared TypeScript Types
// ═══════════════════════════════════════════════════════

// ── Booking ──────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  services: Array<{
    name: string;
    category: string;
    member: string;
    duration: string;
  }>;
  status: BookingStatus;
  notes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  updatedAt?: string;
  customerId?: string;
}

// ── Customer ──────────────────────────────────────────────
export type LoyaltyStatus = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Customer {
  id: string;
  customerId?: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  dateOfBirth?: string;
  anniversary?: string;
  gender?: string;
  notes?: string;
  memberSince?: string;
  preferredStylist?: string;
  preferredServices?: string[];
  customerPhoto?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  upcomingAppointment?: string;
  loyaltyStatus?: LoyaltyStatus;
  status: 'active' | 'inactive' | 'deleted';
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Appointment ──────────────────────────────────────────
export type AppointmentType = 
  | 'Hair Cut' | 'Hair Spa' | 'Facial' | 'Cleanup' 
  | 'Bridal Makeup' | 'Party Makeup' | 'Hair Coloring' 
  | 'Hair Botox' | 'Keratin' | 'Skin Treatment';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  staffId?: string;
  staffName?: string;
  appointmentType: AppointmentType;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ── Consultation ─────────────────────────────────────────
export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  customerId: string;
  customerName?: string;
  consultantId: string | null;
  consultantName?: string;
  consultationDate: string;
  hairType: string | null;
  skinType: string | null;
  problems: string | null;
  suggestions: string | null;
  recommendedServices: string[];
  recommendedProducts: string[];
  beforeImages: string[];
  notes: string | null;
  nextVisit: string | null;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Package ──────────────────────────────────────────────
export interface Package {
  id: string;
  packageName: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  validity: number; // in days
  includedServices: string[];
  totalSessions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ── Customer Package ─────────────────────────────────────
export type CustomerPackageStatus = 'active' | 'expired' | 'completed';

export interface CustomerPackage {
  id: string;
  customerId: string;
  packageId: string;
  packageName: string;
  purchaseDate: string;
  expiryDate: string;
  totalSessions: number;
  remainingSessions: number;
  status: CustomerPackageStatus;
  usageHistory?: Array<{
    date: string;
    service: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

// ── Membership ───────────────────────────────────────────
export type MembershipTier = 'Silver' | 'Gold' | 'Premium';
export type MembershipStatus = 'active' | 'expired' | 'cancelled';

export interface Membership {
  id: string;
  customerId: string;
  customerName: string;
  tier: MembershipTier;
  joiningDate: string;
  expiryDate: string;
  benefits: string[];
  discountPercentage: number;
  membershipCardUrl?: string;
  qrCode?: string;
  barcode?: string;
  status: MembershipStatus;
  createdAt: string;
  updatedAt?: string;
}

// ── WhatsApp Message ─────────────────────────────────────
export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'template';
export type MessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: WhatsAppMessageType;
  content: string;
  mediaUrl?: string;
  templateName?: string;
  deliveryStatus: MessageDeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  createdAt: string;
}

// ── Report ───────────────────────────────────────────────
export type ReportType = 'daily' | 'weekly' | 'monthly';
export type ReportStatus = 'generating' | 'ready' | 'failed';

export interface Report {
  id: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  status: ReportStatus;
  data: {
    totalBookings?: number;
    completedBookings?: number;
    pendingBookings?: number;
    cancelledBookings?: number;
    revenue?: number;
    newCustomers?: number;
    newEnquiries?: number;
    payments?: number;
    popularServices?: Array<{ service: string; count: number }>;
    repeatCustomers?: number;
  };
  pdfUrl?: string;
  excelUrl?: string;
  generatedAt?: string;
  createdAt: string;
}

// ── Billing ───────────────────────────────────────────────
export interface BillItem {
  name: string;
  type: 'service' | 'product';
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  status: 'paid' | 'unpaid' | 'partial';
  notes?: string;
  createdAt: string;
}

// ── Gallery ───────────────────────────────────────────────
export type GalleryCategory = 'Hair' | 'Skin' | 'Nails' | 'Hair Spa' | 'Bridal' | 'Interiors' | 'Other' | 'Before/After';

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  category: GalleryCategory;
  isFeatured: boolean;
  tags?: string[];
  beforeAfter?: { before: string; after: string };
  createdAt: string;
  updatedAt?: string;
}

// ── Service ───────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  duration: string;
  memberPrice: number;
  nonMemberPrice: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ── Review ────────────────────────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  service?: string;
  status: ReviewStatus;
  isFeatured: boolean;
  source?: 'website' | 'google' | 'instagram' | 'manual';
  createdAt: string;
  approvedAt?: string;
}

// ── Notification ──────────────────────────────────────────
export type NotificationType = 'push' | 'email' | 'telegram';
export type NotificationStatus = 'draft' | 'sent' | 'scheduled' | 'failed';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType[];
  status: NotificationStatus;
  targetUrl?: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount?: number;
  successCount?: number;
  failureCount?: number;
  createdAt: string;
}

// ── Coupon ────────────────────────────────────────────────
export type DiscountType = 'percentage' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

// ── Settings ──────────────────────────────────────────────
export interface SalonSettings {
  salonName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
  };
  logoUrl?: string;
  faviconUrl?: string;
  resendApiKey?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  notificationSettings: {
    emailOnBooking: boolean;
    pushOnBooking: boolean;
    telegramOnBooking: boolean;
    sendInvoiceEmail: boolean;
    sendThankYouEmail: boolean;
  };
}

// ── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  totalCustomers: number;
  todayCustomers: number;
  monthlyCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  notificationsSent: number;
  newReviews: number;
  activeServices: number;
}

// ── Activity Log ──────────────────────────────────────────
export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ── API Response ──────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}


// ── Customer Profile ──────────────────────────────────────
export interface CustomerProfile extends Customer {
  bookings: Booking[];
  payments: Bill[];
  appointments: Appointment[];
  consultations: Consultation[];
  packages: CustomerPackage[];
  membership?: Membership;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'booking' | 'payment' | 'appointment' | 'consultation' | 'package' | 'membership' | 'note';
  title: string;
  description?: string;
  amount?: number;
  date: string;
  status?: string;
}
