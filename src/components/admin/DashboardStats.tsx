'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, DollarSign, TrendingUp, Clock, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getAllCustomers, getTodaysBirthdays } from '@/lib/api/customers'
import { getTodaysAppointments, getUpcomingAppointments } from '@/lib/api/appointments'
import { getPaymentStats } from '@/lib/api/payments'

interface Stats {
  totalCustomers: number
  newCustomers: number
  todaysAppointments: number
  tomorrowAppointments: number
  pendingAppointments: number
  todaysBirthdays: number
  revenueToday: number
  revenueMonth: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    newCustomers: 0,
    todaysAppointments: 0,
    tomorrowAppointments: 0,
    pendingAppointments: 0,
    todaysBirthdays: 0,
    revenueToday: 0,
    revenueMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Get customers
      const customers = await getAllCustomers()
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const newCustomers = customers.filter(
        (c) => new Date(c.member_since) >= thirtyDaysAgo
      )

      // Get appointments
      const todaysAppointments = await getTodaysAppointments()
      const upcomingAppointments = await getUpcomingAppointments()

      // Calculate tomorrow's appointments
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      const tomorrowAppointments = upcomingAppointments.filter(
        (apt) => apt.appointment_date === tomorrowStr
      )

      // Get pending appointments
      const pendingAppointments = upcomingAppointments.filter(
        (apt) => apt.booking_status === 'confirmed'
      )

      // Get birthdays
      const birthdayCustomers = await getTodaysBirthdays()

      // Get revenue stats
      const todayStr = today.toISOString().split('T')[0]
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0]

      const todaysRevenue = await getPaymentStats(todayStr, todayStr)
      const monthRevenue = await getPaymentStats(monthStart, todayStr)

      setStats({
        totalCustomers: customers.length,
        newCustomers: newCustomers.length,
        todaysAppointments: todaysAppointments.length,
        tomorrowAppointments: tomorrowAppointments.length,
        pendingAppointments: pendingAppointments.length,
        todaysBirthdays: birthdayCustomers.length,
        revenueToday: todaysRevenue.totalRevenue,
        revenueMonth: monthRevenue.totalRevenue,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: `+${stats.newCustomers} new this month`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments,
      subtitle: `${stats.tomorrowAppointments} tomorrow`,
      icon: Calendar,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      subtitle: 'Upcoming bookings',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: "Today's Birthdays",
      value: stats.todaysBirthdays,
      subtitle: 'Send wishes!',
      icon: Gift,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.revenueToday.toLocaleString()}`,
      subtitle: 'Total collections',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.revenueMonth.toLocaleString()}`,
      subtitle: 'This month',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 bg-gray-900 border-gray-800">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className="p-6 bg-gray-900 border-gray-800 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-2">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
