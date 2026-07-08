'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Search, Plus, RefreshCw, Eye, Gift, TrendingUp, 
  TrendingDown, DollarSign, User, Phone, Mail, Calendar, 
  History, AlertCircle, CheckCircle, CreditCard, Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MembershipWallet {
  id: string;
  membershipId: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  packageName: string;
  totalAmount: number;
  availableBalance: number;
  usedAmount: number;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  expiryDate: string | null;
  notes?: string;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  invoiceNumber?: string;
  bookingId?: string;
  serviceName?: string;
  staffName?: string;
  notes: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function MembershipWalletPage() {
  const [memberships, setMemberships] = useState<MembershipWallet[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMembership, setSelectedMembership] = useState<MembershipWallet | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Create membership form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packageAmount, setPackageAmount] = useState('');
  const [validityMonths, setValidityMonths] = useState('12');
  const [membershipNotes, setMembershipNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load memberships
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const membershipsRes = await fetch(`/api/admin/membership-wallets?${statusParam}`);
      const membershipsData = await membershipsRes.json();
      
      if (membershipsData.success) {
        setMemberships(membershipsData.memberships || []);
      }

      // Load customers
      const customersRes = await fetch('/api/admin/customers?limit=1000');
      const customersData = await customersRes.json();
      
      if (customersData.success) {
        setCustomers(customersData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMembership = async () => {
    // Validation with user-friendly messages
    if (!selectedCustomerId) {
      alert('⚠️ Please select a customer from the dropdown');
      return;
    }
    
    if (!packageAmount || Number(packageAmount) <= 0) {
      alert('⚠️ Please enter a valid membership amount greater than ₹0');
      return;
    }

    if (Number(packageAmount) < 1000) {
      if (!confirm('The membership amount is less than ₹1,000. Are you sure you want to continue?')) {
        return;
      }
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      alert('❌ Customer not found. Please refresh the page and try again.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/membership-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          customerName: customer.name,
          customerPhone: customer.phone,
          packageName: packageName || 'Prepaid Membership Package',
          totalAmount: Number(packageAmount),
          validityMonths: Number(validityMonths),
          notes: membershipNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Membership created successfully!\n\nMembership ID: ${data.membership.membershipId}\nCustomer: ${customer.name}\nAmount: ₹${Number(packageAmount).toLocaleString('en-IN')}\nValidity: ${validityMonths} months`);
        setShowCreateDialog(false);
        setSelectedCustomerId('');
        setPackageName('');
        setPackageAmount('');
        setValidityMonths('12');
        setMembershipNotes('');
        loadData();
      } else {
        alert(`❌ Failed to create membership\n\n${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error creating membership:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const filteredMemberships = memberships.filter(membership =>
    membership.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    membership.customer?.phone?.includes(searchQuery) ||
    membership.membershipId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    membership.packageName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMemberships = memberships.filter(m => m.status === 'active');
  const totalMembershipValue = activeMemberships.reduce((sum, m) => sum + m.totalAmount, 0);
  const totalAvailableBalance = activeMemberships.reduce((sum, m) => sum + m.availableBalance, 0);
  const totalUsedAmount = activeMemberships.reduce((sum, m) => sum + m.usedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#D4447A] text-[10px] tracking-[0.4em] uppercase font-bold">
              Membership Wallets
            </p>
            <h1
              className="text-white text-4xl font-light mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Prepaid Membership Management
            </h1>
            <p className="text-white/70 text-base mt-2">
              Manage prepaid memberships and wallet balances
            </p>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading} className="border-[#D4447A]/30 text-white hover:bg-[#D4447A]/10">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90">
                <Plus size={14} />
                Create Membership
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0D0A14] border-[#D4447A]/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold">Create New Membership</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white font-medium mb-2 block">Select Customer *</Label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full mt-1 bg-[#1A0D15] border border-[#D4447A]/30 rounded-lg px-3 py-2.5 text-white focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A] outline-none"
                  >
                    <option value="" className="bg-[#1A0D15] text-white/70">Choose customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id} className="bg-[#1A0D15] text-white">
                        {customer.name} ({customer.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-white font-medium mb-2 block">Package Name</Label>
                  <Input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Premium Salon Package"
                    className="mt-1 bg-[#1A0D15] border-[#D4447A]/30 text-white placeholder:text-white/50 focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">Membership Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={packageAmount}
                      onChange={(e) => setPackageAmount(e.target.value)}
                      placeholder="15000"
                      className="mt-1 bg-[#1A0D15] border-[#D4447A]/30 text-white placeholder:text-white/50 focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A]"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-medium mb-2 block">Validity (Months)</Label>
                    <Input
                      type="number"
                      value={validityMonths}
                      onChange={(e) => setValidityMonths(e.target.value)}
                      placeholder="12"
                      className="mt-1 bg-[#1A0D15] border-[#D4447A]/30 text-white placeholder:text-white/50 focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white font-medium mb-2 block">Notes (Optional)</Label>
                  <Textarea
                    value={membershipNotes}
                    onChange={(e) => setMembershipNotes(e.target.value)}
                    placeholder="Membership details or special terms..."
                    className="mt-1 bg-[#1A0D15] border-[#D4447A]/30 text-white placeholder:text-white/50 focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A]"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateMembership}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
                >
                  {creating ? 'Creating...' : 'Create Membership'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-400" />
              Active Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{activeMemberships.length}</div>
            <p className="text-white/40 text-xs mt-1">Total: {memberships.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              Total Membership Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(totalMembershipValue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{formatCurrency(totalAvailableBalance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <TrendingDown size={16} className="text-[#D4447A]" />
              Used Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4447A]">{formatCurrency(totalUsedAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <Input
            placeholder="Search by name, phone, membership ID, package..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/[0.02] border-white/10 text-white"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/[0.02] border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A0D15] border-white/10">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Memberships List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin text-[#D4447A] mx-auto mb-3" />
          <p className="text-white/40">Loading memberships...</p>
        </div>
      ) : filteredMemberships.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4447A]/20 to-[#B03060]/10 flex items-center justify-center mx-auto mb-4">
                <Wallet size={40} className="text-[#D4447A]" />
              </div>
              <h3 className="text-white text-xl font-medium mb-2">No Memberships Yet</h3>
              <p className="text-white/50 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No memberships match your search criteria. Try adjusting your filters.'
                  : 'Start creating prepaid membership packages for your customers to offer them convenient payment options.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Membership
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMemberships.map((membership) => (
            <Card key={membership.id} className="bg-white/[0.02] border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4447A]/30 to-[#B03060]/20 flex items-center justify-center shrink-0">
                      <Wallet size={28} className="text-[#D4447A]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-lg">{membership.customer?.name}</h3>
                        <Badge className={getStatusColor(membership.status)}>
                          {membership.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                          {membership.status === 'expired' && <AlertCircle size={12} className="mr-1" />}
                          {membership.status === 'inactive' && <Ban size={12} className="mr-1" />}
                          {membership.status}
                        </Badge>
                      </div>

                      <p className="text-[#D4447A] font-mono text-sm mb-2">
                        ID: {membership.membershipId}
                      </p>

                      <div className="flex items-center gap-4 text-white/60 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {membership.customer?.phone}
                        </span>
                        {membership.customer?.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {membership.customer?.email}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div>
                          <p className="text-white/40 text-xs">Package</p>
                          <p className="text-white font-medium text-sm">{membership.packageName}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Total Amount</p>
                          <p className="text-white font-semibold">{formatCurrency(membership.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Available Balance</p>
                          <p className="text-green-400 font-semibold">{formatCurrency(membership.availableBalance)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Used Amount</p>
                          <p className="text-[#D4447A] font-semibold">{formatCurrency(membership.usedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Usage %</p>
                          <p className="text-amber-400 font-semibold">
                            {((membership.usedAmount / membership.totalAmount) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      {membership.expiryDate && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Calendar size={12} className="text-white/40" />
                          <span className="text-white/40">
                            Expires: {formatDate(membership.expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setSelectedMembership(membership);
                        setShowDetailsDialog(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-[#D4447A]/30 hover:bg-[#D4447A]/10"
                    >
                      <Eye size={14} />
                      View Details
                    </Button>
                    <p className="text-white/30 text-xs text-center">
                      Created {formatDate(membership.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4447A] to-[#B03060]"
                      style={{ width: `${(membership.usedAmount / membership.totalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Membership Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#1A0D15] border-white/10 max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Membership Details</DialogTitle>
          </DialogHeader>

          {selectedMembership && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#D4447A]" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40">Name</p>
                    <p className="text-white">{selectedMembership.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Phone</p>
                    <p className="text-white">{selectedMembership.customer?.phone}</p>
                  </div>
                  {selectedMembership.customer?.email && (
                    <div>
                      <p className="text-white/40">Email</p>
                      <p className="text-white">{selectedMembership.customer?.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/40">Membership ID</p>
                    <p className="text-[#D4447A] font-mono">{selectedMembership.membershipId}</p>
                  </div>
                </div>
              </div>

              {/* Membership Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Gift size={16} className="text-[#D4447A]" />
                  Membership Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-white/60">Package Name</span>
                    <span className="text-white font-medium">{selectedMembership.packageName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Total Amount</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(selectedMembership.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Available Balance</p>
                      <p className="text-green-400 text-xl font-bold">{formatCurrency(selectedMembership.availableBalance)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Used Amount</p>
                      <p className="text-[#D4447A] text-xl font-bold">{formatCurrency(selectedMembership.usedAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white/60">Start Date</span>
                    <span className="text-white">{formatDate(selectedMembership.createdAt)}</span>
                  </div>
                  {selectedMembership.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Expiry Date</span>
                      <span className="text-white">{formatDate(selectedMembership.expiryDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <History size={16} className="text-[#D4447A]" />
                  Transaction History ({selectedMembership.transactions.length})
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedMembership.transactions.length === 0 ? (
                    <p className="text-white/40 text-center py-4">No transactions yet</p>
                  ) : (
                    selectedMembership.transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="bg-white/5 rounded p-3 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              className={
                                txn.type === 'credit'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : txn.type === 'refund'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }
                            >
                              {txn.type}
                            </Badge>
                            <span className="text-white text-sm font-medium">
                              {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                            </span>
                            {txn.invoiceNumber && (
                              <span className="text-white/40 text-xs font-mono">#{txn.invoiceNumber}</span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{txn.description}</p>
                          {txn.serviceName && (
                            <p className="text-white/40 text-xs mt-1">Service: {txn.serviceName}</p>
                          )}
                          {txn.staffName && (
                            <p className="text-white/40 text-xs">Staff: {txn.staffName}</p>
                          )}
                          {txn.notes && txn.notes !== txn.description && (
                            <p className="text-white/30 text-xs mt-1 italic">{txn.notes}</p>
                          )}
                          <p className="text-white/30 text-xs mt-1">{formatDate(txn.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-xs">Balance After</p>
                          <p className="text-white text-sm font-semibold">{formatCurrency(txn.balanceAfter)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

