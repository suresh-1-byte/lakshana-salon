'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, RefreshCw, Printer, Trash2, FileDown, Receipt, Sparkles, CreditCard, CheckCircle, XCircle, Gift, Wallet, Calendar, Tag, Phone } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Bill, BillItem } from '@/types/admin';
import { serviceCategories } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import { getAllAddons } from '@/lib/api/service-addons';
import type { ServiceAddon } from '@/types/database.types';

const PAYMENT_OPTS = [
  { value: 'cash',  label: 'Cash'  },
  { value: 'card',  label: 'Card'  },
  { value: 'upi',   label: 'UPI'   },
  { value: 'membership', label: '💳 Membership Wallet' },
  { value: 'other', label: 'Other' },
];

const EMPTY_ITEM: Partial<BillItem> = { name: '', type: 'service', quantity: 1, unitPrice: 0, discount: 0 };

// Customer Type
type CustomerType = 'normal' | 'membership';

// Membership interface
interface MembershipData {
  id: string;
  membershipId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  amount: number;
  availableBalance: number;
  usedAmount: number;
  discountPercentage: number;
  status: 'active' | 'expired' | 'inactive';
  expiryDate: string;
  totalVisits?: number;
  totalSpent?: number;
  customer?: {
    name: string;
    phone: string;
    email?: string;
    totalVisits?: number;
    totalSpent?: number;
  };
}

function InvoicePrintContent({ bill, salonName = 'Lakshana Premier Beauty Salon' }: { bill: Bill; salonName?: string }) {
  if (!bill) {
    return null;
  }
  
  return (
    <div id="invoice-content" style={{ 
      fontFamily: 'Georgia, serif', 
      color: '#2D1B25', 
      padding: '32px', 
      maxWidth: '680px', 
      margin: '0 auto',
      background: 'white',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #D4447A', paddingBottom: '20px', marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 300, color: '#D4447A', letterSpacing: '0.05em' }}>{salonName}</h1>
        <p style={{ margin: '6px 0 0', color: '#7B4F62', fontSize: '13px' }}>Nolambur, Chennai, Tamil Nadu</p>
      </div>

      {/* Invoice meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 300, color: '#2D1B25' }}>INVOICE</p>
          <p style={{ margin: '4px 0 0', color: '#B89BAA', fontSize: '13px' }}>#{bill.invoiceNumber}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#B89BAA', fontSize: '13px' }}>
            {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ margin: '4px 0 0', color: '#B89BAA', fontSize: '12px', textTransform: 'capitalize' }}>
            Payment: {bill.paymentMethod}
          </p>
        </div>
      </div>

      {/* Bill to */}
      <div style={{ background: '#FFF0F5', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#D4447A', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Bill To</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#2D1B25' }}>{bill.customerName}</p>
        <p style={{ margin: '2px 0 0', color: '#7B4F62', fontSize: '13px' }}>{bill.customerPhone}</p>
        {bill.customerEmail && <p style={{ margin: '2px 0 0', color: '#7B4F62', fontSize: '13px' }}>{bill.customerEmail}</p>}
      </div>

      {/* Items table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginBottom: '24px', 
        fontSize: '13px',
        display: 'table',
        tableLayout: 'fixed'
      }}>
        <thead style={{ display: 'table-header-group' }}>
          <tr style={{ 
            background: '#D4447A', 
            color: 'white',
            display: 'table-row'
          }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 400, letterSpacing: '0.1em', display: 'table-cell' }}>Service / Product</th>
            <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 400, display: 'table-cell' }}>Qty</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400, display: 'table-cell' }}>Unit Price</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400, display: 'table-cell' }}>Discount</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 400, display: 'table-cell' }}>Total</th>
          </tr>
        </thead>
        <tbody style={{ display: 'table-row-group' }}>
          {bill.items && bill.items.length > 0 ? (
            bill.items.map((item, i) => (
              <tr key={i} style={{ 
                borderBottom: '1px solid #FCE4EC', 
                background: i % 2 ? '#FFF8FC' : '#fff',
                display: 'table-row'
              }}>
                <td style={{ padding: '10px 14px', color: '#2D1B25', display: 'table-cell' }}>{item.name}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#7B4F62', display: 'table-cell' }}>{item.quantity}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#2D1B25', display: 'table-cell' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#22C55E', display: 'table-cell' }}>{item.discount ? `-₹${item.discount}` : '—'}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#2D1B25', display: 'table-cell' }}>₹{item.total.toLocaleString('en-IN')}</td>
              </tr>
            ))
          ) : (
            <tr style={{ display: 'table-row' }}>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#B89BAA', display: 'table-cell' }}>
                No items in this invoice
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
        <div style={{ width: '220px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7B4F62', borderBottom: '1px solid #FCE4EC' }}>
            <span>Subtotal</span><span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {bill.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#22C55E', borderBottom: '1px solid #FCE4EC' }}>
              <span>Discount</span><span>-₹{bill.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          {bill.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7B4F62', borderBottom: '1px solid #FCE4EC' }}>
              <span>Tax</span><span>₹{bill.tax.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#D4447A', fontWeight: 700, fontSize: '18px', borderTop: '2px solid #D4447A', marginTop: '4px' }}>
            <span>TOTAL</span><span>₹{bill.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {bill.notes && (
        <div style={{ padding: '12px 16px', background: '#FFF0F5', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#7B4F62', fontSize: '13px' }}><strong>Note:</strong> {bill.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #FCE4EC', paddingTop: '20px' }}>
        <p style={{ margin: 0, color: '#D4447A', fontSize: '15px' }}>Thank you for choosing {salonName}! 💄</p>
        <p style={{ margin: '6px 0 0', color: '#B89BAA', fontSize: '12px' }}>
          Visit us again soon • Nolambur, Chennai
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [bills, setBills]       = useState<Bill[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [printBill, setPrintBill]   = useState<Bill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    discount: 0, tax: 0, paymentMethod: 'cash', notes: '',
  });
  const [items, setItems] = useState<Partial<BillItem>[]>([{ ...EMPTY_ITEM }]);

  // NEW: Customer Type and Membership States
  const [customerType, setCustomerType] = useState<CustomerType>('normal');
  const [membershipSearch, setMembershipSearch] = useState('');
  const [searchingMemberships, setSearchingMemberships] = useState(false);
  const [membershipResults, setMembershipResults] = useState<MembershipData[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<MembershipData | null>(null);
  const [membershipDiscount, setMembershipDiscount] = useState(0);
  const [useWalletPayment, setUseWalletPayment] = useState(false);
  const [showMembershipOffer, setShowMembershipOffer] = useState(false);

  // Load add-ons
  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      const data = await getAllAddons(true); // activeOnly = true
      setAddons(data);
    } catch (error) {
      console.error('Error loading add-ons:', error);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  // NEW: Search memberships in real-time
  const searchMemberships = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setMembershipResults([]);
      return;
    }

    setSearchingMemberships(true);
    try {
      const res = await fetch(`/api/admin/membership-wallets?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setMembershipResults(data.memberships || []);
      }
    } catch (error) {
      console.error('Error searching memberships:', error);
      setMembershipResults([]);
    } finally {
      setSearchingMemberships(false);
    }
  };

  // NEW: Debounced membership search
  useEffect(() => {
    if (customerType === 'membership' && membershipSearch) {
      const timer = setTimeout(() => {
        searchMemberships(membershipSearch);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setMembershipResults([]);
    }
  }, [membershipSearch, customerType]);

  // NEW: Select membership and auto-fill details
  const selectMembership = (membership: MembershipData) => {
    setSelectedMembership(membership);
    setForm(prev => ({
      ...prev,
      customerName: membership.customer?.name || membership.customerName,
      customerPhone: membership.customer?.phone || membership.customerPhone,
      customerEmail: membership.customer?.email || '',
    }));
    setMembershipSearch('');
    setMembershipResults([]);

    // Auto-apply discount if active
    if (membership.status === 'active' && membership.discountPercentage > 0) {
      setShowMembershipOffer(true);
      setTimeout(() => setShowMembershipOffer(false), 5000);
    }
  };

  // NEW: Calculate membership discount
  const calculateMembershipDiscount = () => {
    if (!selectedMembership || selectedMembership.status !== 'active') {
      return 0;
    }
    
    const subtotalWithAddons = subtotal + addonsTotal;
    return Math.round(subtotalWithAddons * (selectedMembership.discountPercentage / 100));
  };

  // NEW: Reset form when customer type changes
  const handleCustomerTypeChange = (type: CustomerType) => {
    setCustomerType(type);
    setSelectedMembership(null);
    setMembershipSearch('');
    setMembershipResults([]);
    setMembershipDiscount(0);
    setUseWalletPayment(false);
    setShowMembershipOffer(false);
    
    if (type === 'normal') {
      // Keep form data for normal customers
    } else {
      // Clear for membership search
      setForm({
        customerName: '', 
        customerPhone: '', 
        customerEmail: '',
        discount: 0, 
        tax: 0, 
        paymentMethod: 'cash', 
        notes: '',
      });
    }
  };

  const fetchBills = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/billing?search=${encodeURIComponent(search)}&limit=50`);
    const data = await res.json();
    if (data.success) setBills(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBills, 300);
    return () => clearTimeout(t);
  }, [fetchBills]);

  const addItem = () => setItems(p => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: unknown) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((s, i) => s + ((i.unitPrice || 0) * (i.quantity || 1)) - (i.discount || 0), 0);
  const addonsTotal = selectedAddons.reduce((s, id) => {
    const addon = addons.find(a => a.id === id);
    return s + (addon?.price || 0);
  }, 0);
  
  // Calculate membership discount if applicable
  const autoMembershipDiscount = selectedMembership?.status === 'active' 
    ? calculateMembershipDiscount() 
    : 0;
  
  const totalDiscount = (form.discount || 0) + autoMembershipDiscount;
  const total = subtotal + addonsTotal - totalDiscount + (form.tax || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items[0]?.name) { 
      toast({ title: 'Add at least one service or item', variant: 'destructive' }); 
      return; 
    }
    
    // Membership customer validation
    if (customerType === 'membership') {
      if (!selectedMembership) {
        toast({ 
          title: '❌ No Membership Selected', 
          description: 'Please search and select a membership first.',
          variant: 'destructive'
        });
        return;
      }

      // Ensure form has membership customer data
      if (!form.customerName || !form.customerPhone) {
        setForm(prev => ({
          ...prev,
          customerName: selectedMembership.customer?.name || selectedMembership.customerName,
          customerPhone: selectedMembership.customer?.phone || selectedMembership.customerPhone,
          customerEmail: selectedMembership.customer?.email || prev.customerEmail,
        }));
      }

      // Check if trying to use wallet payment
      if (useWalletPayment) {
        if (selectedMembership.status !== 'active') {
          toast({ 
            title: '❌ Membership Expired', 
            description: 'This membership has expired. Wallet payment is not available.',
            variant: 'destructive'
          });
          return;
        }

        if (selectedMembership.availableBalance < total) {
          const shortfall = total - selectedMembership.availableBalance;
          toast({ 
            title: '⚠️ Insufficient Wallet Balance',
            description: `Required: ₹${total.toLocaleString('en-IN')} | Available: ₹${selectedMembership.availableBalance.toLocaleString('en-IN')} | Shortfall: ₹${shortfall.toLocaleString('en-IN')}`,
            variant: 'destructive'
          });
          return;
        }
      }
    }
    
    // Validate normal customer fields
    if (customerType === 'normal' && (!form.customerName || !form.customerPhone)) {
      toast({ 
        title: '❌ Required Fields Missing', 
        description: 'Please fill in customer name and phone number.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Include selected add-ons as items
      const addonItems = selectedAddons.map(id => {
        const addon = addons.find(a => a.id === id);
        return {
          name: addon?.name || 'Add-on',
          type: 'service' as const,
          quantity: 1,
          unitPrice: addon?.price || 0,
          discount: 0,
          total: addon?.price || 0,
        };
      });
      
      const allItems = [...items, ...addonItems];
      
      // Prepare customer data
      let customerData = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
      };

      // Override with membership data if membership customer
      if (customerType === 'membership' && selectedMembership) {
        customerData = {
          customerName: selectedMembership.customer?.name || selectedMembership.customerName,
          customerPhone: selectedMembership.customer?.phone || selectedMembership.customerPhone,
          customerEmail: selectedMembership.customer?.email || form.customerEmail || '',
        };
      }
      
      // Prepare bill data
      const billData: any = {
        ...customerData,
        items: allItems,
        discount: form.discount, // Additional discount
        tax: form.tax,
        notes: form.notes,
        paymentMethod: useWalletPayment ? 'membership' : form.paymentMethod,
      };

      // Add membership data if applicable
      if (customerType === 'membership' && selectedMembership) {
        billData.membershipId = selectedMembership.membershipId;
        billData.membershipWalletId = selectedMembership.id;
        billData.membershipType = selectedMembership.packageName;
        billData.membershipDiscountPercentage = selectedMembership.discountPercentage;
        billData.membershipDiscountAmount = autoMembershipDiscount;
        
        // If using wallet payment
        if (useWalletPayment && selectedMembership.status === 'active') {
          billData.useMembershipWallet = true;
        }
      }
      
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast({ 
          title: `✅ Bill created successfully!`,
          description: `Invoice: ${data.invoiceNumber}${data.membershipDeducted ? ' | Paid via Membership Wallet' : ''}` 
        });
        
        // Reset form
        setCreateOpen(false);
        setItems([{ ...EMPTY_ITEM }]);
        setSelectedAddons([]);
        setCustomerType('normal');
        setSelectedMembership(null);
        setMembershipSearch('');
        setUseWalletPayment(false);
        setForm({ 
          customerName:'', 
          customerPhone:'', 
          customerEmail:'', 
          discount:0, 
          tax:0, 
          paymentMethod:'cash', 
          notes:'' 
        });
        fetchBills();
      } else {
        toast({ 
          title: data.error || 'Failed to create bill', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({ 
        title: 'Error creating bill', 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (bill: Bill) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => setPrintBill(null), 1000);
    }, 500);
  };

  const handleDelete = async (bill: Bill) => {
    if (!confirm(`Are you sure you want to delete bill #${bill.invoiceNumber}?\n\n${bill.paidViaMembership ? 'The amount will be refunded to the membership wallet.' : 'This action cannot be undone.'}`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/billing?id=${bill.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({ 
          title: data.message || '✅ Bill deleted successfully',
          description: `Invoice #${bill.invoiceNumber} has been removed`,
        });
        fetchBills();
      } else {
        toast({ 
          title: data.error || 'Failed to delete bill', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({ 
        title: 'Error deleting bill', 
        variant: 'destructive' 
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export?type=billing');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lakshana-billing-${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast({ title: 'Billing report exported!' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    setExporting(false);
  };

  // Revenue summary
  const totalRevenue = bills.reduce((s, b) => s + (b.total || 0), 0);
  const paidBills    = bills.filter(b => b.status === 'paid').length;

  const columns = [
    {
      key: 'invoiceNumber' as keyof Bill,
      label: 'Invoice',
      render: (b: Bill) => <span className="text-[#D4447A] text-sm font-mono font-bold">#{b.invoiceNumber}</span>,
    },
    {
      key: 'customerName' as keyof Bill,
      label: 'Customer',
      render: (b: Bill) => (
        <div>
          <p className="text-white text-sm font-medium">{b.customerName}</p>
          <p className="text-white/35 text-[11px]">{b.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'items' as keyof Bill,
      label: 'Services',
      render: (b: Bill) => (
        <div>
          <p className="text-white/60 text-sm">{b.items?.[0]?.name || '—'}</p>
          {(b.items?.length ?? 0) > 1 && <p className="text-white/25 text-[11px]">+{(b.items?.length ?? 0) - 1} more</p>}
        </div>
      ),
    },
    {
      key: 'total' as keyof Bill,
      label: 'Amount',
      render: (b: Bill) => <span className="text-white font-semibold text-sm">₹{(b.total || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'paymentMethod' as keyof Bill,
      label: 'Payment',
      render: (b: Bill) => <span className="text-white/40 text-sm capitalize">{b.paymentMethod}</span>,
    },
    {
      key: 'status' as keyof Bill,
      label: 'Status',
      render: (b: Bill) => <StatusBadge status={b.status} />,
    },
    {
      key: 'createdAt' as keyof Bill,
      label: 'Date',
      render: (b: Bill) => (
        <span className="text-white/30 text-[11px]">
          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
        </span>
      ),
    },
    {
      key: 'id' as keyof Bill,
      label: 'Print',
      render: (b: Bill) => (
        <button onClick={e => { e.stopPropagation(); handlePrint(b); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-[#D4447A] hover:bg-[rgba(212,68,122,0.1)] transition-all">
          <Printer size={14} />
        </button>
      ),
    },
    {
      key: 'id' as keyof Bill,
      label: 'Delete',
      render: (b: Bill) => (
        <button onClick={e => { e.stopPropagation(); handleDelete(b); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-red-500 hover:bg-[rgba(239,68,68,0.1)] transition-all">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bills',    value: bills.length,               color: '#D4447A' },
          { label: 'Paid',           value: paidBills,                  color: '#22C55E' },
          { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#D4AF37' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }}>
            <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
            <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice, customer, phone..."
            className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 text-white/70 text-sm outline-none placeholder:text-white/25 focus:border-[rgba(212,68,122,0.4)]" />
        </div>
        <button onClick={fetchBills}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
          <RefreshCw size={14} />
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="h-10 px-4 rounded-xl flex items-center gap-2 text-[#D4447A] text-sm border border-[rgba(212,68,122,0.3)] hover:bg-[rgba(212,68,122,0.1)] transition-all disabled:opacity-50">
          <FileDown size={14} /> {exporting ? 'Exporting...' : 'Export'}
        </button>
        <button onClick={() => setCreateOpen(true)}
          className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.3)' }}>
          <Plus size={14} /> Create Bill
        </button>
      </div>

      <AdminTable columns={columns} data={bills} loading={loading} emptyMessage="No bills created yet" />

      {/* Create Bill Modal */}
      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Bill" size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Customer Type Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Customer Type *</p>
              <div className="group relative">
                <div className="w-4 h-4 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/40 text-[10px] cursor-help">
                  ?
                </div>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 rounded-lg bg-[#1A0D15] border border-[#D4447A]/30 shadow-xl">
                  <p className="text-xs text-white/80 mb-2">Choose customer type:</p>
                  <p className="text-[11px] text-white/60 mb-1">• <strong className="text-[#D4447A]">Normal Customer</strong>: Regular billing</p>
                  <p className="text-[11px] text-white/60">• <strong className="text-[#D4447A]">Membership</strong>: Auto discount + wallet payment</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCustomerTypeChange('normal')}
                className={`
                  h-14 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-sm font-medium relative overflow-hidden
                  ${customerType === 'normal' 
                    ? 'bg-gradient-to-br from-[rgba(212,68,122,0.2)] to-[rgba(176,48,96,0.15)] border-[#D4447A] text-white shadow-lg shadow-[#D4447A]/20' 
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:bg-white/[0.04]'}
                `}
              >
                {customerType === 'normal' && (
                  <motion.div
                    layoutId="customerTypeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#D4447A]/10 to-[#B03060]/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center relative ${customerType === 'normal' ? 'border-[#D4447A]' : 'border-white/30'}`}>
                  <AnimatePresence>
                    {customerType === 'normal' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-3 h-3 rounded-full bg-[#D4447A]"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span className="relative z-10">Normal Customer</span>
                {customerType === 'normal' && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-3 text-[#22C55E]"
                  >
                    <CheckCircle size={16} />
                  </motion.span>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCustomerTypeChange('membership')}
                className={`
                  h-14 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-sm font-medium relative overflow-hidden
                  ${customerType === 'membership' 
                    ? 'bg-gradient-to-br from-[rgba(212,68,122,0.2)] to-[rgba(176,48,96,0.15)] border-[#D4447A] text-white shadow-lg shadow-[#D4447A]/20' 
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:bg-white/[0.04]'}
                `}
              >
                {customerType === 'membership' && (
                  <motion.div
                    layoutId="customerTypeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#D4447A]/10 to-[#B03060]/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center relative ${customerType === 'membership' ? 'border-[#D4447A]' : 'border-white/30'}`}>
                  <AnimatePresence>
                    {customerType === 'membership' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-3 h-3 rounded-full bg-[#D4447A]"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <CreditCard size={16} className="relative z-10" />
                <span className="relative z-10">Membership</span>
                {customerType === 'membership' && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-3 text-[#22C55E]"
                  >
                    <CheckCircle size={16} />
                  </motion.span>
                )}
              </motion.button>
            </div>
            
            {/* Helper text */}
            <AnimatePresence mode="wait">
              {customerType === 'membership' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-xs text-white/40 flex items-center gap-1"
                >
                  <Sparkles size={12} className="text-[#D4AF37]" />
                  Get automatic discount + wallet payment option
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Normal Customer Form */}
          {customerType === 'normal' && (
            <div className="grid grid-cols-3 gap-4">
              <AdminInput label="Customer Name *" value={form.customerName}
                onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} required placeholder="Full name" />
              <AdminInput label="Phone *" type="tel" value={form.customerPhone}
                onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} required placeholder="+91..." />
              <AdminInput label="Email (optional)" type="email" value={form.customerEmail}
                onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))} placeholder="For invoice email" />
            </div>
          )}

          {/* Membership Customer Search */}
          {customerType === 'membership' && !selectedMembership && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Search Membership</p>
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/40 text-[10px] cursor-help">
                    ?
                  </div>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-56 p-3 rounded-lg bg-[#1A0D15] border border-[#D4447A]/30 shadow-xl">
                    <p className="text-xs text-white/80 mb-2">Search by:</p>
                    <p className="text-[11px] text-white/60 mb-1">• Phone number (9876543210)</p>
                    <p className="text-[11px] text-white/60 mb-1">• Customer name (Priya)</p>
                    <p className="text-[11px] text-white/60">• Membership ID (MEM123)</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={membershipSearch}
                  onChange={(e) => setMembershipSearch(e.target.value)}
                  placeholder="Type phone number, name, or membership ID..."
                  className="w-full h-14 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border-2 border-white/10 rounded-xl pl-12 pr-12 text-white text-sm outline-none placeholder:text-white/30 focus:border-[#D4447A]/50 focus:shadow-lg focus:shadow-[#D4447A]/10 transition-all"
                  autoFocus
                />
                {searchingMemberships && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw size={16} className="text-[#D4447A]" />
                    </motion.div>
                  </div>
                )}
                {membershipSearch && !searchingMemberships && (
                  <button
                    type="button"
                    onClick={() => {
                      setMembershipSearch('');
                      setMembershipResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>

              {/* Search hint */}
              {membershipSearch.length > 0 && membershipSearch.length < 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-white/40 flex items-center gap-1"
                >
                  <Search size={12} />
                  Type at least 3 characters to search...
                </motion.p>
              )}

              {/* Search Results */}
              <AnimatePresence>
                {membershipResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 rounded-xl border-2 border-[#D4447A]/20 bg-gradient-to-br from-white/[0.05] to-white/[0.02] max-h-80 overflow-y-auto custom-scrollbar"
                  >
                    <div className="p-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-2">
                        Found {membershipResults.length} {membershipResults.length === 1 ? 'membership' : 'memberships'}
                      </p>
                      {membershipResults.map((membership, index) => (
                        <motion.button
                          key={membership.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          type="button"
                          onClick={() => selectMembership(membership)}
                          className="w-full p-4 text-left border border-white/5 rounded-xl hover:bg-[rgba(212,68,122,0.1)] hover:border-[#D4447A]/30 transition-all flex items-center justify-between group mb-2"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-semibold text-sm">{membership.customer?.name || membership.customerName}</p>
                              {membership.status === 'active' && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/50">
                              <span className="flex items-center gap-1">
                                <Phone size={11} />
                                {membership.customer?.phone || membership.customerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard size={11} />
                                {membership.membershipId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag size={11} />
                                {membership.packageName}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold mb-1 ${membership.status === 'active' ? 'text-[#D4447A]' : 'text-red-400'}`}>
                              ₹{membership.availableBalance.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-white/40 flex items-center gap-1 justify-end group-hover:text-[#D4447A] transition-colors">
                              Click to select
                              <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                →
                              </motion.span>
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No results */}
              {membershipSearch.length >= 3 && !searchingMemberships && membershipResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-6 rounded-xl bg-white/[0.02] border border-white/10 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-white/30" />
                  </div>
                  <p className="text-white/60 text-sm mb-1">No memberships found</p>
                  <p className="text-white/40 text-xs">Try searching with phone number or customer name</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Selected Membership Card */}
          {customerType === 'membership' && selectedMembership && (
            <div className="rounded-2xl p-5 border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(212,68,122,0.15), rgba(176,48,96,0.1))',
                borderColor: selectedMembership.status === 'active' ? '#22C55E' : '#EF4444',
                boxShadow: '0 8px 32px rgba(212,68,122,0.2)',
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={18} className="text-[#D4447A]" />
                    <p className="text-white font-bold text-lg">{selectedMembership.packageName}</p>
                  </div>
                  <p className="text-white/60 text-sm">💳 {selectedMembership.membershipId}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedMembership.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedMembership.status === 'active' ? '✅ Active' : '❌ Expired'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Customer</p>
                  <p className="text-white text-sm font-medium">{selectedMembership.customer?.name || selectedMembership.customerName}</p>
                  <p className="text-white/60 text-xs">📱 {selectedMembership.customer?.phone || selectedMembership.customerPhone}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Expiry Date</p>
                  <p className="text-white text-sm font-medium">
                    <Calendar size={12} className="inline mr-1" />
                    {new Date(selectedMembership.expiryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/20 mb-4">
                <div className="text-center">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Wallet Balance</p>
                  <p className="text-[#D4AF37] text-lg font-bold">₹{selectedMembership.availableBalance.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Discount</p>
                  <p className="text-[#22C55E] text-lg font-bold">{selectedMembership.discountPercentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Total Spent</p>
                  <p className="text-white text-lg font-bold">₹{(selectedMembership.customer?.totalSpent || selectedMembership.usedAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Membership Offer Banner */}
              <AnimatePresence>
                {selectedMembership.status === 'active' && selectedMembership.discountPercentage > 0 && showMembershipOffer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#22C55E]/20 to-[#10B981]/20 border border-[#22C55E]/30 mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Gift size={16} className="text-[#22C55E]" />
                      <div>
                        <p className="text-[#22C55E] font-bold text-sm">🎉 Membership Offer Applied!</p>
                        <p className="text-white/60 text-xs">{selectedMembership.discountPercentage}% discount will be applied automatically</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wallet Payment Option */}
              {selectedMembership.status === 'active' && selectedMembership.availableBalance > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setUseWalletPayment(!useWalletPayment)}
                    className={`
                      w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center
                      ${useWalletPayment ? 'bg-[#D4447A] border-[#D4447A]' : 'border-white/30'}
                    `}
                  >
                    {useWalletPayment && <CheckCircle size={16} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      <Wallet size={14} className="inline mr-1" />
                      Pay using Membership Wallet
                    </p>
                    <p className="text-white/40 text-xs">Available: ₹{selectedMembership.availableBalance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedMembership(null);
                  setUseWalletPayment(false);
                  setForm({ customerName: '', customerPhone: '', customerEmail: '', discount: 0, tax: 0, paymentMethod: 'cash', notes: '' });
                }}
                className="w-full mt-3 h-9 rounded-xl text-white/50 text-xs border border-white/10 hover:bg-white/5 transition-all"
              >
                Change Membership
              </button>
            </div>
          )}

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Services / Products</p>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-[#D4447A] text-xs hover:text-white transition-colors">
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  {/* Service picker */}
                  <div className="col-span-5">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Service / Product</p>}
                    <select value={item.name} onChange={e => {
                      const name = e.target.value;
                      const allSvcs = serviceCategories.flatMap(c => c.services);
                      const svc = allSvcs.find(s => s.name === name);
                      updateItem(i, 'name', name);
                      if (svc) {
                        const price = parseFloat(svc.member.replace(/[^0-9.]/g, '')) || 0;
                        updateItem(i, 'unitPrice', price);
                        updateItem(i, 'type', 'service');
                      }
                    }}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 outline-none"
                      style={{ background: '#1A1025' }}>
                      <option value="">— Select —</option>
                      {serviceCategories.map(cat => (
                        <optgroup key={cat.id} label={cat.title} style={{ background: '#1A1025' }}>
                          {cat.services.map(s => (
                            <option key={s.name} value={s.name} style={{ background: '#1A1025' }}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Custom" style={{ background: '#1A1025' }}>
                        <option value="__custom" style={{ background: '#1A1025' }}>Custom item…</option>
                      </optgroup>
                    </select>
                    {item.name === '__custom' && (
                      <input placeholder="Item name" onChange={e => updateItem(i, 'name', e.target.value)}
                        className="w-full h-9 mt-1 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                    )}
                  </div>
                  {/* Qty */}
                  <div className="col-span-1">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Qty</p>}
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', +e.target.value)}
                      className="w-full h-10 rounded-xl px-2 text-sm text-white text-center border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Price */}
                  <div className="col-span-2">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Price (₹)</p>}
                    <input type="number" min="0" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', +e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Discount */}
                  <div className="col-span-2">
                    {i === 0 && <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1.5">Disc (₹)</p>}
                    <input type="number" min="0" value={item.discount}
                      onChange={e => updateItem(i, 'discount', +e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none" />
                  </div>
                  {/* Total */}
                  <div className="col-span-2 flex items-center justify-between">
                    {i === 0 && <div />}
                    <span className="text-[#D4447A] text-sm font-semibold">
                      ₹{((item.unitPrice || 0) * (item.quantity || 1) - (item.discount || 0)).toLocaleString('en-IN')}
                    </span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons section */}
          {addons.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#D4447A]" />
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A]">Add-ons</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {addons.map(addon => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`
                        p-3 rounded-xl border transition-all text-left
                        ${isSelected 
                          ? 'bg-[rgba(212,68,122,0.15)] border-[#D4447A] ring-2 ring-[rgba(212,68,122,0.3)]' 
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`text-sm font-medium ${isSelected ? 'text-[#D4447A]' : 'text-white/80'}`}>
                          {addon.name}
                        </p>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D4447A] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mb-2 line-clamp-2">{addon.description}</p>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-[#D4447A]' : 'text-white/60'}`}>
                        +₹{addon.price.toLocaleString('en-IN')}
                      </p>
                    </button>
                  );
                })}
              </div>
              {selectedAddons.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[rgba(212,68,122,0.08)] border border-[rgba(212,68,122,0.2)]">
                  <p className="text-xs text-white/60 mb-2">Selected Add-ons:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAddons.map(id => {
                      const addon = addons.find(a => a.id === id);
                      return addon ? (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D4447A]/20 text-[#D4447A] text-xs">
                          {addon.name} • ₹{addon.price}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discount / Tax / Payment */}
          <div className="grid grid-cols-3 gap-4">
            <AdminInput 
              label="Additional Discount (₹)" 
              type="number" 
              min="0"
              value={String(form.discount)} 
              onChange={e => setForm(p => ({ ...p, discount: +e.target.value }))} 
            />
            <AdminInput 
              label="Tax (₹)" 
              type="number" 
              min="0"
              value={String(form.tax)} 
              onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} 
            />
            <AdminSelect 
              label="Payment Method" 
              value={useWalletPayment ? 'membership' : form.paymentMethod}
              onChange={e => {
                if (e.target.value !== 'membership') {
                  setForm(p => ({ ...p, paymentMethod: e.target.value }));
                }
              }} 
              options={PAYMENT_OPTS}
              disabled={useWalletPayment}
            />
          </div>

          {/* Total summary */}
          <div className="flex justify-end">
            <div className="rounded-xl p-4 w-72"
              style={{ background: 'rgba(212,68,122,0.08)', border: '1px solid rgba(212,68,122,0.2)' }}>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Add-ons ({selectedAddons.length})</span>
                    <span>+₹{addonsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {autoMembershipDiscount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      Membership Discount ({selectedMembership?.discountPercentage}%)
                    </span>
                    <span>-₹{autoMembershipDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {form.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Additional Discount</span>
                    <span>-₹{form.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {form.tax > 0 && (
                  <div className="flex justify-between text-white/40">
                    <span>Tax</span>
                    <span>+₹{form.tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-[#D4447A] font-bold text-lg pt-2" style={{ borderTop: '1px solid rgba(212,68,122,0.2)' }}>
                  <span>TOTAL</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* Wallet Payment Info */}
                {useWalletPayment && selectedMembership && (
                  <div className="pt-2 mt-2 space-y-1" style={{ borderTop: '1px solid rgba(212,68,122,0.2)' }}>
                    <div className="flex justify-between text-[#D4AF37] text-xs">
                      <span>Wallet Balance</span>
                      <span>₹{selectedMembership.availableBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#D4447A] text-xs">
                      <span>Amount to Deduct</span>
                      <span>-₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-green-400 text-xs font-bold">
                      <span>Remaining Balance</span>
                      <span>₹{(selectedMembership.availableBalance - total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AdminTextarea label="Notes (optional)" value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes for this bill..." />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="flex-1 h-10 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
              <Receipt size={14} />
              {submitting ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Print invoice (hidden, shows on window.print()) */}
      {printBill && (
        <div 
          id="print-content" 
          className="print:block hidden fixed inset-0 z-[9999] bg-white overflow-auto"
          style={{ display: 'none' }}
        >
          <InvoicePrintContent bill={printBill} />
        </div>
      )}
    </div>
  );
}
