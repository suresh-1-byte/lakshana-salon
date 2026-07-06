'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Send, Gift, Clock, RefreshCw, Cake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BirthdayCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  whatsappNumber?: string;
  daysUntilBirthday: number;
  birthdayDate: string;
}

export default function BirthdayRemindersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayCustomer[]>([]);

  useEffect(() => {
    loadUpcomingBirthdays();
  }, []);

  const loadUpcomingBirthdays = async () => {
    setLoading(true);
    try {
      // Get upcoming birthdays (next 14 days)
      const response = await fetch('/api/birthdays/upcoming?days=14');
      const data = await response.json();
      
      if (data.success) {
        setUpcomingBirthdays(data.birthdays || []);
      }
    } catch (error) {
      console.error('Error loading birthdays:', error);
      toast({
        title: 'Error',
        description: 'Failed to load upcoming birthdays',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/cron/birthday-reminders', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: `Sent ${data.sent} birthday reminders`,
        });
        loadUpcomingBirthdays();
      } else {
        throw new Error(data.error || 'Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminders',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // Group by days until birthday
  const upcoming7Days = upcomingBirthdays.filter(c => c.daysUntilBirthday <= 7);
  const upcoming14Days = upcomingBirthdays.filter(c => c.daysUntilBirthday > 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">
              Birthday Management
            </p>
            <h1 className="text-white text-3xl font-light mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Upcoming Birthdays & Reminders
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Automatic reminders sent 7 days before birthdays with 20% discount offer
            </p>
          </motion.div>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={loadUpcomingBirthdays}
            variant="outline"
            disabled={loading}
            className="h-10"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          
          <Button
            onClick={sendReminders}
            disabled={sending || upcoming7Days.length === 0}
            className="h-10 bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
          >
            <Send size={14} className="mr-2" />
            {sending ? 'Sending...' : `Send Reminders (${upcoming7Days.length})`}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Cake size={16} className="text-[#D4447A]" />
              Next 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4447A]">
              {upcoming7Days.length}
            </div>
            <p className="text-xs text-white/40 mt-1">
              Will receive reminders automatically
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" />
              Next 8-14 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {upcoming14Days.length}
            </div>
            <p className="text-xs text-white/40 mt-1">
              Coming up soon
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              Birthday Offer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              20%
            </div>
            <p className="text-xs text-white/40 mt-1">
              Discount for birthday customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Birthdays List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin text-[#D4447A] mx-auto mb-3" />
          <p className="text-white/40">Loading birthdays...</p>
        </div>
      ) : upcomingBirthdays.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="py-12 text-center">
            <Cake size={48} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No upcoming birthdays in the next 14 days</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Next 7 Days - Will Get Reminders */}
          {upcoming7Days.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                <Clock size={18} className="text-[#D4447A]" />
                Next 7 Days (Reminder Scheduled)
              </h2>
              <div className="grid gap-3">
                {upcoming7Days.map((customer, idx) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-gradient-to-r from-[rgba(212,68,122,0.1)] to-transparent border-[rgba(212,68,122,0.3)]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#D4447A]/20 flex items-center justify-center">
                              <Cake size={20} className="text-[#D4447A]" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{customer.name}</h3>
                              <p className="text-white/60 text-sm">{customer.phone}</p>
                              {customer.email && (
                                <p className="text-white/40 text-xs">{customer.email}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#D4447A]">
                              {customer.daysUntilBirthday}
                            </div>
                            <p className="text-white/40 text-xs">
                              {customer.daysUntilBirthday === 0 ? 'Today!' :
                               customer.daysUntilBirthday === 1 ? 'Tomorrow' :
                               `days away`}
                            </p>
                            <p className="text-white/60 text-sm mt-1">
                              {new Date(customer.birthdayDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Next 8-14 Days */}
          {upcoming14Days.length > 0 && (
            <div className="mt-6">
              <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                Next 8-14 Days
              </h2>
              <div className="grid gap-3">
                {upcoming14Days.map((customer, idx) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/[0.02] border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                              <Cake size={20} className="text-white/40" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{customer.name}</h3>
                              <p className="text-white/60 text-sm">{customer.phone}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-400">
                              {customer.daysUntilBirthday}
                            </div>
                            <p className="text-white/40 text-xs">days away</p>
                            <p className="text-white/60 text-sm mt-1">
                              {new Date(customer.birthdayDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
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
      <Card className="bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Gift size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">Automatic Birthday Reminders</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Reminders are automatically sent <strong className="text-amber-400">7 days before</strong> each customer's birthday 
                via WhatsApp, offering a <strong className="text-amber-400">20% discount</strong> on all services. 
                The system runs daily at 9 AM IST. You can also manually trigger reminders using the button above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
