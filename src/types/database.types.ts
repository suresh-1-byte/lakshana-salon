export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>
      }
      packages: {
        Row: Package
        Insert: Omit<Package, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Package, 'id' | 'created_at' | 'updated_at'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      consultations: {
        Row: Consultation
        Insert: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Consultation, 'id' | 'created_at' | 'updated_at'>>
      }
      enquiries: {
        Row: Enquiry
        Insert: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>>
      }
      memberships: {
        Row: Membership
        Insert: Omit<Membership, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Membership, 'id' | 'created_at' | 'updated_at'>>
      }
      customer_packages: {
        Row: CustomerPackage
        Insert: Omit<CustomerPackage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomerPackage, 'id' | 'created_at' | 'updated_at'>>
      }
      photo_gallery: {
        Row: PhotoGallery
        Insert: Omit<PhotoGallery, 'id' | 'uploaded_at'>
        Update: Partial<Omit<PhotoGallery, 'id' | 'uploaded_at'>>
      }
      whatsapp_messages: {
        Row: WhatsAppMessage
        Insert: Omit<WhatsAppMessage, 'id' | 'created_at'>
        Update: Partial<Omit<WhatsAppMessage, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>
      }
      message_templates: {
        Row: MessageTemplate
        Insert: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>>
      }
      google_sheets_sync_log: {
        Row: GoogleSheetsSyncLog
        Insert: Omit<GoogleSheetsSyncLog, 'id' | 'created_at'>
        Update: Partial<Omit<GoogleSheetsSyncLog, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Customer {
  id: string
  customer_id: string
  full_name: string
  mobile_number: string
  whatsapp_number: string | null
  email: string | null
  date_of_birth: string | null
  anniversary: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  address: string | null
  city: string | null
  notes: string | null
  member_since: string
  preferred_stylist: string | null
  preferred_services: string[] | null
  customer_photo: string | null
  total_visits: number
  total_spent: number
  last_visit: string | null
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  category_id: string | null
  description: string | null
  price: number
  offer_price: number | null
  duration: number
  image: string | null
  display_order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ServiceAddon {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  icon: string | null
  display_order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ServiceAddonMapping {
  id: string
  service_id: string
  addon_id: string
  is_default: boolean
  created_at: string
}

export interface Package {
  id: string
  package_name: string
  description: string | null
  price: number
  offer_price: number | null
  services_included: any
  validity_days: number
  total_sessions: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  staff_name: string
  phone: string
  email: string | null
  role: 'Super Admin' | 'Admin' | 'Receptionist' | 'Stylist' | 'Staff'
  photo: string | null
  joining_date: string
  salary: number | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  booking_id: string
  customer_id: string
  service_id: string | null
  package_id: string | null
  stylist_id: string | null
  appointment_date: string
  appointment_time: string
  duration: number
  notes: string | null
  advance_amount: number
  balance_amount: number
  total_amount: number
  booking_status: 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  addons?: Array<{
    id: string
    name: string
    price: number
  }>
  selected_services?: Array<{
    id: string
    name: string
    category: string
    price: number
    duration: number
  }>
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  appointment_id: string
  customer_id: string
  invoice_number: string
  amount: number
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer'
  payment_status: 'pending' | 'paid' | 'refunded'
  transaction_id: string | null
  notes: string | null
  payment_date: string
  created_at: string
}

export interface Consultation {
  id: string
  customer_id: string
  consultant_id: string | null
  consultation_date: string
  hair_type: string | null
  skin_type: string | null
  problems: string | null
  suggestions: string | null
  recommended_services: string[] | null
  recommended_products: string[] | null
  before_images: string[] | null
  notes: string | null
  next_visit: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Enquiry {
  id: string
  name: string
  phone: string
  email: string | null
  interested_service: string | null
  message: string | null
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  customer_id: string
  membership_type: 'Silver' | 'Gold' | 'Premium'
  joining_date: string
  expiry_date: string
  discount_percentage: number
  benefits: any
  member_card_number: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CustomerPackage {
  id: string
  customer_id: string
  package_id: string
  purchase_date: string
  expiry_date: string
  total_sessions: number
  remaining_sessions: number
  amount_paid: number
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface PhotoGallery {
  id: string
  customer_id: string
  appointment_id: string | null
  image_type: 'before' | 'after'
  service_category: 'Hair' | 'Skin' | 'Makeup' | 'Nails' | 'Other'
  image_url: string
  notes: string | null
  uploaded_at: string
}

export interface WhatsAppMessage {
  id: string
  customer_id: string
  message_type: string
  message_template: string
  message_content: string
  phone_number: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  message_id: string | null
  sent_at: string
  created_at: string
}

export interface Notification {
  id: string
  notification_type: string
  title: string
  message: string
  reference_id: string | null
  reference_type: string | null
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: any
  new_data: any
  ip_address: string | null
  created_at: string
}

export interface MessageTemplate {
  id: string
  template_name: string
  template_type: string
  template_content: string
  variables: string[] | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface GoogleSheetsSyncLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  sync_status: 'pending' | 'success' | 'failed'
  error_message: string | null
  retry_count: number
  synced_at: string | null
  created_at: string
}
