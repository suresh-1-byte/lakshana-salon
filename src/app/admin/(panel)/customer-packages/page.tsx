'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Search, Plus, RefreshCw, Eye, Gift, TrendingUp, 
  TrendingDown, DollarSign, User, Phone, Mail, Calendar, 
  History, AlertCircle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerPackage {
  id: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  totalAmount: number;
  availableBalance: number;
  usedAmount: number;
  status: 'active' | 'inactive' | 'completed';
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  bookingId?: string;
  notes: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function CustomerPackagesPage() {
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<CustomerPackage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Create package form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [packageAmount, setPackageAmount] = useState('');
  const [packageNotes, setPackageNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load packages
      const packagesRes = await fetch('/api/admin/customer-packages');
      const packagesData = await packagesRes.json();
      
      if (packagesData.success) {
        setPackages(packagesData.packages || []);
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

  const handleCreatePackage = async () => {
    if (!selectedCustomerId || !packageAmount || Number(packageAmount) <= 0) {
      alert('Please select a customer and enter a valid package amount');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    setCreating(true);
    try {
      const response = await fetch('/api/admin/customer-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          customerName: customer.name,
          customerPhone: customer.phone,
          totalAmount: Number(packageAmount),
          notes: packageNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Package created successfully!');
        setShowCreateDialog(false);
        setSelectedCustomerId('');
        setPackageAmount('');
        setPackageNotes('');
        loadData();
      } else {
        alert(data.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package');
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.customer.phone.includes(searchQuery)
  );

  const activePackages = packages.filter(p => p.status === 'active');
  const totalPackageValue = activePackages.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalAvailableBalance = activePackages.reduce((sum, p) => sum + p.availableBalance, 0);
  const totalUsedAmount = activePackages.reduce((sum, p) => sum + p.usedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">
              Customer Packages
            </p>
            <h1
              className="text-white text-3xl font-light mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Package Management
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Manage prepaid service packages and track usage
            </p>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90">
                <Plus size={14} />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A0D15] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Package</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white/70">Select Customer</Label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Choose customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-white/70">Package Amount (₹)</Label>
                  <Input
                    type="number"
                    value={packageAmount}
                    onChange={(e) => setPackageAmount(e.target.value)}
                    placeholder="15000"
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/70">Notes (Optional)</Label>
                  <Textarea
                    value={packageNotes}
                    onChange={(e) => setPackageNotes(e.target.value)}
                    placeholder="Package details or special terms..."
                    className="mt-1 bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreatePackage}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
                >
                  {creating ? 'Creating...' : 'Create Package'}
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
              <Package size={16} className="text-blue-400" />
              Active Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{activePackages.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              Total Package Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(totalPackageValue)}</div>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <Input
          placeholder="Search by customer name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white"
        />
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin text-[#D4447A] mx-auto mb-3" />
          <p className="text-white/40">Loading packages...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="py-12 text-center">
            <Package size={48} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No packages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="bg-white/[0.02] border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4447A]/30 to-[#B03060]/20 flex items-center justify-center shrink-0">
                      <Gift size={24} className="text-[#D4447A]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-lg">{pkg.customer.name}</h3>
                      <div className="flex items-center gap-3 text-white/60 text-sm mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {pkg.customer.phone}
                        </span>
                        {pkg.customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {pkg.customer.email}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div>
                          <p className="text-white/40 text-xs">Total Package</p>
                          <p className="text-white font-semibold">{formatCurrency(pkg.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Available</p>
                          <p className="text-green-400 font-semibold">{formatCurrency(pkg.availableBalance)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Used</p>
                          <p className="text-[#D4447A] font-semibold">{formatCurrency(pkg.usedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Usage %</p>
                          <p className="text-amber-400 font-semibold">
                            {((pkg.usedAmount / pkg.totalAmount) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Badge
                          className={
                            pkg.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }
                        >
                          {pkg.status === 'active' ? (
                            <><CheckCircle size={12} className="mr-1" /> Active</>
                          ) : (
                            <><AlertCircle size={12} className="mr-1" /> {pkg.status}</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowDetailsDialog(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View Details
                    </Button>
                    <p className="text-white/40 text-xs text-center">
                      Created {formatDate(pkg.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4447A] to-[#B03060]"
                      style={{ width: `${(pkg.usedAmount / pkg.totalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Package Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#1A0D15] border-white/10 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Package Details</DialogTitle>
          </DialogHeader>

          {selectedPackage && (
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
                    <p className="text-white">{selectedPackage.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Phone</p>
                    <p className="text-white">{selectedPackage.customer.phone}</p>
                  </div>
                  {selectedPackage.customer.email && (
                    <div>
                      <p className="text-white/40">Email</p>
                      <p className="text-white">{selectedPackage.customer.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Package Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Gift size={16} className="text-[#D4447A]" />
                  Package Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Total Package</p>
                    <p className="text-white text-xl font-bold">{formatCurrency(selectedPackage.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Available</p>
                    <p className="text-green-400 text-xl font-bold">{formatCurrency(selectedPackage.availableBalance)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Used</p>
                    <p className="text-[#D4447A] text-xl font-bold">{formatCurrency(selectedPackage.usedAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <History size={16} className="text-[#D4447A]" />
                  Transaction History ({selectedPackage.transactions.length})
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPackage.transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="bg-white/5 rounded p-3 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              txn.type === 'credit'
                                ? 'bg-green-500/20 text-green-400'
                                : txn.type === 'refund'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-red-500/20 text-red-400'
                            }
                          >
                            {txn.type}
                          </Badge>
                          <span className="text-white text-sm font-medium">
                            {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{txn.description}</p>
                        {txn.notes && <p className="text-white/40 text-xs mt-1">{txn.notes}</p>}
                        <p className="text-white/30 text-xs mt-1">{formatDate(txn.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-xs">Balance</p>
                        <p className="text-white text-sm">{formatCurrency(txn.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
