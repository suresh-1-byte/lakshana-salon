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
  name: string;
  phone: string;
  email: string;
  address?: string;
  dateOfBirth?: string;
  anniversary?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  loyaltyStatus: LoyaltyStatus;
  createdAt: string;
  updatedAt?: string;
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
