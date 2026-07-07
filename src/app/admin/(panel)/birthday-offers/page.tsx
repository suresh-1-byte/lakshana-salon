'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Cake, Phone, MessageCircle, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BirthdayCustomer {
  id: string;
  full_name: string;
  mobile_number: string;
  whatsapp_number: string | null;
  email: string | null;
  date_of_birth: string;
  daysUntilBirthday: number;
  birthdayDate: string;
  isToday: boolean;
}

export default function BirthdayOffersPage() {
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
      // Get all customers with DOB
      const { data: allCustomers, error: allError } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .not('date_of_birth', 'is', null);

      if (allError) throw allError;

      setTotalCustomers(allCustomers?.length || 0);

      // Filter for upcoming birthdays (next 7 days)
      const today = new Date();
      const birthdayCustomers: BirthdayCustomer[] = [];

      allCustomers?.forEach((customer) => {
        const dob = new Date(customer.date_of_birth);
        const thisYear = today.getFullYear();
        const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());

        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(thisYear + 1);
        }

        const daysUntil = Math.ceil(
          (birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= 7) {
          birthdayCustomers.push({
            id: customer.id,
            full_name: customer.full_name,
            mobile_number: customer.mobile_number,
            whatsapp_number: customer.whatsapp_number,
            email: customer.email,
            date_of_birth: customer.date_of_birth,
            daysUntilBirthday: daysUntil,
            birthdayDate: birthdayThisYear.toISOString().split('T')[0],
            isToday: daysUntil === 0,
          });
        }
      });

      // Sort by nearest birthday first
      birthdayCustomers.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

      setCustomers(birthdayCustomers);
      setTodayCount(birthdayCustomers.filter((c) => c.isToday).length);
      setUpcomingCount(birthdayCustomers.length);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = (customer: BirthdayCustomer) => {
    const message = `Hi ${customer.full_name} 🎉🎂

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
    const phone = (customer.whatsapp_number || customer.mobile_number).replace(/[^0-9]/g, '');
    const message = generateWhatsAppMessage(customer);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile_number.includes(searchQuery)
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
              Send personalized birthday offers via WhatsApp - No API needed!
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-[#D4447A]/30 flex items-center justify-center">
                              <Cake size={24} className="text-[#D4447A]" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium text-lg">{customer.full_name}</h3>
                              <div className="flex items-center gap-3 text-white/60 text-sm mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {customer.mobile_number}
                                </span>
                                {customer.email && (
                                  <span className="text-white/40 text-xs">{customer.email}</span>
                                )}
                              </div>
                              <Badge className="bg-[#D4447A]/20 text-[#D4447A] border-[#D4447A]/30 mt-2">
                                🎂 Birthday Today!
                              </Badge>
                            </div>
                          </div>

                          <Button
                            onClick={() => sendWhatsApp(customer)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 flex items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            Send WhatsApp Offer
                          </Button>
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
            <div className="mt-6">
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                              <Cake size={20} className="text-white/60" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{customer.full_name}</h3>
                              <div className="flex items-center gap-3 text-white/60 text-sm mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {customer.mobile_number}
                                </span>
                                {customer.email && (
                                  <span className="text-white/40 text-xs">{customer.email}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
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

                          <Button
                            onClick={() => sendWhatsApp(customer)}
                            variant="outline"
                            className="flex items-center gap-2 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                          >
                            <MessageCircle size={16} />
                            Send Offer
                          </Button>
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
            <MessageCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">🆓 Free WhatsApp Integration - No API Needed!</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Click <strong className="text-green-400">"Send WhatsApp Offer"</strong> to open WhatsApp with a pre-filled
                birthday message. The message includes a <strong className="text-amber-400">20% discount offer</strong> and
                complimentary services. No API keys or automation setup required - works instantly on mobile and desktop!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
