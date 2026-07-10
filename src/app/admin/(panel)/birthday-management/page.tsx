'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Cake, Phone, MessageCircle, RefreshCw, Search, Mail, MessageSquare, Send, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BirthdayCustomer {
  id: string;
  name: string;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  dateOfBirth: string;
  anniversary?: string;
  daysUntilBirthday: number;
  daysUntilAnniversary?: number;
  birthdayDate: string;
  anniversaryDate?: string;
  isToday: boolean;
  eventType: 'birthday' | 'anniversary' | 'both';
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  dateOfBirth?: string | null;
}

export default function BirthdayManagementPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<BirthdayCustomer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showAddBirthdayDialog, setShowAddBirthdayDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBirthdayCustomers();
    loadAllCustomers();
  }, []);

  const loadAllCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        setAllCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadBirthdayCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/birthday-management');
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers || []);
        setTotalCustomers(data.stats.totalCustomers || 0);
        setTodayCount(data.stats.todayCount || 0);
        setUpcomingCount(data.stats.upcomingCount || 0);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async () => {
    if (!selectedCustomerId) {
      alert('⚠️ Please select a customer');
      return;
    }

    if (!birthdayDate) {
      alert('⚠️ Please enter a date of birth');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/customers/update-birthday', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          dateOfBirth: birthdayDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Birthday added successfully!\n\nCustomer: ${data.customer.name}\nDate of Birth: ${new Date(birthdayDate).toLocaleDateString('en-IN')}`);
        setShowAddBirthdayDialog(false);
        setSelectedCustomerId('');
        setBirthdayDate('');
        loadBirthdayCustomers();
        loadAllCustomers();
      } else {
        alert(`❌ Failed to add birthday\n\n${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error adding birthday:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateWhatsAppMessage = (customer: BirthdayCustomer) => {
    const isBirthday = customer.eventType === 'birthday' || customer.eventType === 'both';
    const isAnniversary = customer.eventType === 'anniversary' || customer.eventType === 'both';
    
    let greeting = '';
    let occasion = '';
    
    if (customer.eventType === 'both') {
      greeting = `Hi ${customer.name} 🎉🎂💐`;
      occasion = 'Your birthday AND anniversary are';
    } else if (isBirthday) {
      greeting = `Hi ${customer.name} 🎉🎂`;
      occasion = 'Your birthday is';
    } else {
      greeting = `Hi ${customer.name} 💐🎉`;
      occasion = 'Your anniversary is';
    }
    
    const daysText = customer.isToday 
      ? 'today' 
      : customer.daysUntilBirthday === 1 || customer.daysUntilAnniversary === 1
        ? 'tomorrow'
        : `in ${customer.daysUntilBirthday || customer.daysUntilAnniversary} days`;

    const offerTitle = customer.eventType === 'both' 
      ? '*🎁 Birthday & Anniversary Special:*'
      : isBirthday 
        ? '*🎁 Birthday Special Offer:*'
        : '*💐 Anniversary Special Offer:*';

    const message = `${greeting}

${occasion} ${daysText}! 🥳

We have a special offer exclusively for you 🎁✨

${offerTitle}
✨ 20% OFF on all services
🌸 Complimentary hair spa
💅 Free nail art design
${isAnniversary ? '💑 Couple\'s package available' : ''}

Celebrate your special day with us and enjoy our exclusive offer.

Valid for 2 weeks from your ${customer.eventType === 'both' ? 'special day' : (isBirthday ? 'birthday' : 'anniversary')}! 💖

Contact us to book your appointment.

*Lakshana Premier Beauty Salon*
📍 Nolambur, Chennai
📞 Call us to book

Thank you ❤️`;

    return encodeURIComponent(message);
  };

  const sendWhatsApp = (customer: BirthdayCustomer) => {
    const phone = (customer.whatsappNumber || customer.phone).replace(/[^0-9]/g, '');
    const message = generateWhatsAppMessage(customer);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmail = (customer: BirthdayCustomer) => {
    const subject = encodeURIComponent(`🎉 Happy Birthday ${customer.name}! Special Offer Inside`);
    const body = encodeURIComponent(`Dear ${customer.name},

🎂 Happy Birthday! 🎉

We hope your special day is filled with joy and happiness!

To celebrate your birthday, we have an exclusive offer just for you:

🎁 BIRTHDAY SPECIAL OFFER:
✨ 20% OFF on all services
🌸 Complimentary hair spa
💅 Free nail art design

This offer is valid for 2 weeks from your birthday!

Visit us at:
Lakshana Premier Beauty Salon
📍 Nolambur, Chennai

To book your appointment, reply to this email or call us.

Warm wishes,
Lakshana Beauty Salon Team

---
This is a personalized birthday offer. Not valid with other promotions.`);
    
    const mailtoUrl = `mailto:${customer.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const sendSMS = (customer: BirthdayCustomer) => {
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${customer.name}! 🎉 Happy Birthday! Celebrate with us - Get 20% OFF + Complimentary services. Valid 2 weeks. Visit Lakshana Beauty Salon, Nolambur. Book now!`);
    const smsUrl = `sms:${phone}${navigator.userAgent.includes('iPhone') ? '&' : '?'}body=${message}`;
    window.location.href = smsUrl;
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const todayCustomers = filteredCustomers.filter((c) => c.isToday);
  const upcomingCustomers = filteredCustomers.filter((c) => !c.isToday);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">
              Birthday Management
            </p>
            <h1
              className="text-white text-3xl font-light mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Birthdays & Anniversaries - Send Special Offers
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Send personalized birthday & anniversary offers via WhatsApp - No API needed! 🎂💐
            </p>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadBirthdayCustomers} variant="outline" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          
          <Button
            onClick={() => setShowAddBirthdayDialog(true)}
            className="bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
          >
            <UserPlus size={14} />
            Add Birthday
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Cake size={16} className="text-blue-400" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{totalCustomers}</div>
            <p className="text-xs text-white/40 mt-1">With birthday data</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Gift size={16} className="text-[#D4447A]" />
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4447A]">{todayCount}</div>
            <p className="text-xs text-white/40 mt-1">Birthdays & Anniversaries</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{upcomingCount}</div>
            <p className="text-xs text-white/40 mt-1">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <Input
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white"
        />
      </div>

      {/* Birthday Customers */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin text-[#D4447A] mx-auto mb-3" />
          <p className="text-white/40">Loading birthdays...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4447A]/20 to-[#B03060]/10 flex items-center justify-center mx-auto mb-4">
                <Cake size={40} className="text-[#D4447A]" />
              </div>
              <h3 className="text-white text-xl font-medium mb-2">
                {searchQuery ? 'No Matching Events' : 'No Upcoming Events'}
              </h3>
              <p className="text-white/50 mb-2">
                {searchQuery 
                  ? 'No customers found matching your search in the next 7 days.'
                  : 'There are no birthdays or anniversaries in the next 7 days.'}
              </p>
              <p className="text-white/40 text-sm">
                {!searchQuery && 'Customer birthdays and anniversaries will appear here when they are within the next week.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's Birthdays */}
          {todayCustomers.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                <Gift size={18} className="text-[#D4447A]" />
                Today's Special Days 🎉
              </h2>
              <div className="grid gap-3">
                {todayCustomers.map((customer, idx) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-gradient-to-r from-[rgba(212,68,122,0.2)] to-transparent border-[rgba(212,68,122,0.4)]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-[#D4447A]/30 flex items-center justify-center shrink-0">
                              <Cake size={24} className="text-[#D4447A]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-lg truncate">{customer.name}</h3>
                              <div className="flex items-center gap-3 text-white/60 text-sm mt-1 flex-wrap">
                                <a 
                                  href={`https://wa.me/${(customer.whatsappNumber || customer.phone).replace(/[^0-9]/g, '')}?text=${generateWhatsAppMessage(customer)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone size={12} />
                                  <span className="underline">{customer.phone}</span>
                                </a>
                                {customer.email && (
                                  <span className="text-white/40 text-xs truncate">{customer.email}</span>
                                )}
                              </div>
                              <Badge className="bg-[#D4447A]/20 text-[#D4447A] border-[#D4447A]/30 mt-2">
                                {customer.eventType === 'both' ? '🎂💐 Birthday & Anniversary Today!' : 
                                 customer.eventType === 'anniversary' ? '💐 Anniversary Today!' : 
                                 '🎂 Birthday Today!'}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => sendWhatsApp(customer)}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 flex items-center gap-1"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </Button>
                            {customer.email && (
                              <Button
                                onClick={() => sendEmail(customer)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                              >
                                <Mail size={14} />
                                Email
                              </Button>
                            )}
                            <Button
                              onClick={() => sendSMS(customer)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400"
                            >
                              <MessageSquare size={14} />
                              SMS
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Birthdays */}
          {upcomingCustomers.length > 0 && (
            <div className={todayCustomers.length > 0 ? 'mt-6' : ''}>
              <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                Upcoming Events (Next 7 Days)
              </h2>
              <div className="grid gap-3">
                {upcomingCustomers.map((customer, idx) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/[0.02] border-white/10 hover:border-white/20 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                              <Cake size={20} className="text-white/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{customer.name}</h3>
                              <div className="flex items-center gap-3 text-white/60 text-sm mt-1 flex-wrap">
                                <a 
                                  href={`https://wa.me/${(customer.whatsappNumber || customer.phone).replace(/[^0-9]/g, '')}?text=${generateWhatsAppMessage(customer)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone size={12} />
                                  <span className="underline">{customer.phone}</span>
                                </a>
                                {customer.email && (
                                  <span className="text-white/40 text-xs truncate">{customer.email}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {customer.birthdayDate && (
                                  <>
                                    <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                                      🎂 {new Date(customer.birthdayDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </Badge>
                                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                      {customer.daysUntilBirthday === 1 ? 'Tomorrow' : `In ${customer.daysUntilBirthday} days`}
                                    </Badge>
                                  </>
                                )}
                                {customer.anniversaryDate && (
                                  <>
                                    <Badge variant="outline" className="text-pink-400 border-pink-400/30">
                                      💐 {new Date(customer.anniversaryDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </Badge>
                                    <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                                      {customer.daysUntilAnniversary === 1 ? 'Tomorrow' : `In ${customer.daysUntilAnniversary} days`}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => sendWhatsApp(customer)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </Button>
                            {customer.email && (
                              <Button
                                onClick={() => sendEmail(customer)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                              >
                                <Mail size={14} />
                                Email
                              </Button>
                            )}
                            <Button
                              onClick={() => sendSMS(customer)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400"
                            >
                              <MessageSquare size={14} />
                              SMS
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Send size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">🆓 FREE Communication Options - No APIs Needed!</h3>
              <div className="space-y-2 text-white/60 text-sm leading-relaxed">
                <p>
                  <strong className="text-green-400">WhatsApp:</strong> Opens WhatsApp with pre-filled birthday message including 20% discount offer.
                </p>
                <p>
                  <strong className="text-blue-400">Email:</strong> Opens your email app with pre-filled subject and birthday offer message.
                </p>
                <p>
                  <strong className="text-purple-400">SMS:</strong> Opens SMS app with pre-filled birthday text message.
                </p>
                <p className="text-amber-400 text-xs mt-3">
                  All methods are completely FREE - no API keys, subscriptions, or automation setup required. Works on mobile and desktop!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Birthday Dialog */}
      <Dialog open={showAddBirthdayDialog} onOpenChange={setShowAddBirthdayDialog}>
        <DialogContent className="bg-[#0D0A14] border-[#D4447A]/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Add Customer Birthday</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white font-medium mb-2 block">Select Customer</Label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 bg-[#1A0D15] border border-[#D4447A]/30 rounded-lg px-3 py-2.5 text-white focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A] outline-none"
              >
                <option value="" className="bg-[#1A0D15] text-white/70">Choose customer...</option>
                {allCustomers
                  .filter(c => !c.dateOfBirth) // Only show customers without birthday
                  .map((customer) => (
                    <option key={customer.id} value={customer.id} className="bg-[#1A0D15] text-white">
                      {customer.name} ({customer.phone})
                    </option>
                  ))}
              </select>
              <p className="text-white/40 text-xs mt-1">
                Only showing customers without birthday data
              </p>
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Date of Birth</Label>
              <Input
                type="date"
                value={birthdayDate}
                onChange={(e) => setBirthdayDate(e.target.value)}
                className="mt-1 bg-[#1A0D15] border-[#D4447A]/30 text-white focus:border-[#D4447A] focus:ring-1 focus:ring-[#D4447A]"
              />
            </div>

            <Button
              onClick={handleAddBirthday}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
            >
              {saving ? 'Saving...' : 'Add Birthday'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
