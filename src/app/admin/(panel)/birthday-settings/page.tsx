'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Settings, AlertCircle, CheckCircle2, Send, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface CustomerDOBStats {
  total: number;
  withDOB: number;
  withoutDOB: number;
  percentage: number;
  customersWithoutDOB: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
  }>;
}

export default function BirthdaySettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerDOBStats | null>(null);
  const [testingSending, setTestingSending] = useState(false);

  useEffect(() => {
    loadDOBStats();
  }, []);

  const loadDOBStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/customers/dob-stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading DOB stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer DOB statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testBirthdayReminder = async () => {
    setTestingSending(true);
    try {
      const response = await fetch('/api/admin/birthdays/test-reminder', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Test Successful!',
          description: 'Test birthday reminder sent successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to send test reminder');
      }
    } catch (error) {
      console.error('Error sending test reminder:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send test reminder',
        variant: 'destructive',
      });
    } finally {
      setTestingSending(false);
    }
  };

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
              Birthday System
            </p>
            <h1 className="text-white text-3xl font-light mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Birthday Settings & DOB Collection
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Manage birthday notification settings and track DOB collection progress
            </p>
          </motion.div>
        </div>
      </div>

      {/* DOB Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {loading ? '...' : stats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              With DOB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {loading ? '...' : stats?.withDOB || 0}
            </div>
            <p className="text-xs text-white/40 mt-1">
              {loading ? '' : `${stats?.percentage.toFixed(1)}% of customers`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              Without DOB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              {loading ? '...' : stats?.withoutDOB || 0}
            </div>
            <p className="text-xs text-white/40 mt-1">
              {loading ? '' : `${(100 - (stats?.percentage || 0)).toFixed(1)}% missing`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#D4447A]/20 to-transparent border-[#D4447A]/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <Gift size={16} className="text-[#D4447A]" />
              Reminder Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4447A]">
              7
            </div>
            <p className="text-xs text-white/40 mt-1">
              Days before birthday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings size={20} className="text-[#D4447A]" />
            Birthday Automation System Status
          </CardTitle>
          <CardDescription className="text-white/60">
            System configuration and operational status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Cron Job Status</h4>
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  Active
                </Badge>
              </div>
              <p className="text-white/60 text-sm">
                Runs daily at 9:00 AM IST (configured in vercel.json)
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">WhatsApp Integration</h4>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                  Configured
                </Badge>
              </div>
              <p className="text-white/60 text-sm">
                Messages sent via WhatsApp Cloud API
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Reminder Timing</h4>
                <Badge className="bg-[#D4447A]/20 text-[#D4447A] border-[#D4447A]/30">
                  7 Days Before
                </Badge>
              </div>
              <p className="text-white/60 text-sm">
                Customers receive reminder exactly 1 week before birthday
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Birthday Offer</h4>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30">
                  20% Discount
                </Badge>
              </div>
              <p className="text-white/60 text-sm">
                Valid for 2 weeks (before & after birthday)
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={testBirthdayReminder}
              disabled={testingSending}
              className="bg-gradient-to-r from-[#D4447A] to-[#B03060] hover:opacity-90"
            >
              <Send size={14} className="mr-2" />
              {testingSending ? 'Sending Test...' : 'Send Test Reminder'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Without DOB */}
      {!loading && stats && stats.withoutDOB > 0 && (
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-400">Action Required</AlertTitle>
          <AlertDescription className="text-white/80">
            {stats.withoutDOB} customer{stats.withoutDOB !== 1 ? 's' : ''} missing date of birth. 
            Please collect DOB information when customers visit to enable birthday reminders.
          </AlertDescription>
        </Alert>
      )}

      {!loading && stats && stats.customersWithoutDOB.length > 0 && (
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar size={20} className="text-amber-400" />
              Customers Missing DOB ({stats.customersWithoutDOB.length})
            </CardTitle>
            <CardDescription className="text-white/60">
              Update customer profiles to add date of birth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.customersWithoutDOB.slice(0, 20).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/10 hover:bg-white/[0.04] transition-colors"
                >
                  <div>
                    <h4 className="text-white font-medium">{customer.name}</h4>
                    <p className="text-white/60 text-sm">{customer.phone}</p>
                    {customer.email && (
                      <p className="text-white/40 text-xs">{customer.email}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/admin/customers/${customer.id}`, '_blank')}
                  >
                    Edit Profile
                  </Button>
                </div>
              ))}
              {stats.customersWithoutDOB.length > 20 && (
                <p className="text-white/40 text-sm text-center py-2">
                  Showing 20 of {stats.customersWithoutDOB.length} customers
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">How Birthday System Works</h3>
              <ul className="text-white/60 text-sm space-y-1 leading-relaxed">
                <li>• <strong className="text-blue-400">Collect DOB:</strong> Add date of birth in customer profile when they visit</li>
                <li>• <strong className="text-blue-400">Auto Reminder:</strong> System automatically sends WhatsApp reminder 7 days before birthday</li>
                <li>• <strong className="text-blue-400">Special Offer:</strong> Customers receive 20% discount offer valid for 2 weeks</li>
                <li>• <strong className="text-blue-400">Daily Cron:</strong> System checks daily at 9 AM and sends reminders automatically</li>
                <li>• <strong className="text-blue-400">Manual Trigger:</strong> You can also manually trigger reminders from Birthday Reminders page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
