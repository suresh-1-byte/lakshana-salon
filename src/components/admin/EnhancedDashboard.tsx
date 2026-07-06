'use client';

// ═══════════════════════════════════════════════════════
//  Enhanced Dashboard with All Widgets
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { 
  Users, Calendar, DollarSign, TrendingUp, 
  Clock, Package, Gift, Activity 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BirthdayWidget from './BirthdayWidget';
import type { BirthdayCustomer } from '@/lib/api/birthdays';
import type { Appointment } from '@/types/admin';
import type { DailyReport } from '@/lib/api/reports';

export interface DashboardStats {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedToday: number;
  newCustomersToday: number;
}

interface EnhancedDashboardProps {
  initialStats?: DashboardStats;
  birthdays?: BirthdayCustomer[];
  todayAppointments?: Appointment[];
  recentActivities?: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
  }>;
}

export default function EnhancedDashboard({
  initialStats,
  birthdays = [],
  todayAppointments = [],
  recentActivities = [],
}: EnhancedDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats || {
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    newCustomersToday: 0,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats.todayRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Weekly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{stats.weeklyRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Customers</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.totalCustomers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Today's Appointments</p>
                <p className="text-xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pending</p>
                <p className="text-xl font-bold text-orange-600">{stats.pendingAppointments}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Completed Today</p>
                <p className="text-xl font-bold text-green-600">{stats.completedToday}</p>
              </div>
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">New Customers</p>
                <p className="text-xl font-bold text-purple-600">{stats.newCustomersToday}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Birthday Widget */}
        <BirthdayWidget birthdays={birthdays} onRefresh={handleRefresh} />

        {/* Today's Appointments Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{appointment.customerName}</p>
                      <p className="text-sm text-neutral-600">
                        {appointment.appointmentType} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-neutral-600" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.slice(0, 10).map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border-l-2 border-amber-600">
                  <div className="flex-1">
                    <p className="font-semibold">{activity.action}</p>
                    <p className="text-sm text-neutral-600">{activity.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
