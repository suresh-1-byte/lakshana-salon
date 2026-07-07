'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Cake, Phone, MessageCircle, RefreshCw, Search, Mail, MessageSquare, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BirthdayCustomer {
  id: string;
  name: string;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  dateOfBirth: string;
  daysUntilBirthday: number;
  birthdayDate: string;
  isToday: boolean;
}

export default function BirthdayManagementPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<BirthdayCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    loadBirthdayCustomers();
  }, []);

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

  const generateWhatsAppMessage = (customer: BirthdayCustomer) => {
    const message = `Hi ${customer.name} 🎉🎂

Your birthday is ${customer.isToday ? 'today' : `coming ${customer.daysUntilBirthday === 1 ? 'tomorrow' : `in ${customer.daysUntilBirthday} days`}`}! 🥳

We have a special birthday offer exclusively for you 🎁✨

*🎁 Birthday Special Offer:*
✨ 20% OFF on all services
🌸 Complimentary hair spa
💅 Free nail art design

Celebrate your special day with us and enjoy our exclusive birthday offer.

Valid for 2 weeks from your birthday! 💖

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
              Upcoming Birthdays & WhatsApp Offers
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Send personalized birthday offers via WhatsApp - No API needed! 🎂
            </p>
          </motion.div>
        </div>

        <Button onClick={loadBirthdayCustomers} variant="outline" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
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
              Birthdays Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4447A]">{todayCount}</div>
            <p className="text-xs text-white/40 mt-1">Send wishes now!</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" />
              Next 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{upcomingCount}</div>
            <p className="text-xs text-white/40 mt-1">Upcoming birthdays</p>
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
          <CardContent className="py-12 text-center">
            <Cake size={48} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No upcoming birthdays in the next 7 days</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's Birthdays */}
          {todayCustomers.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                <Gift size={18} className="text-[#D4447A]" />
                Birthdays Today 🎉
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
                                🎂 Birthday Today!
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
                Upcoming Birthdays (Next 7 Days)
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
                                <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                                  📅 {new Date(customer.birthdayDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </Badge>
                                <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                  {customer.daysUntilBirthday === 1 ? 'Tomorrow' : `In ${customer.daysUntilBirthday} days`}
                                </Badge>
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
    </div>
  );
}
