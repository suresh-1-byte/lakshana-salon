'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cake, Calendar, Loader2 } from 'lucide-react'

export default function BirthdayWidget() {
  const [stats, setStats] = useState({
    todayCount: 0,
    upcomingCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Just try to load, but don't fail if it doesn't exist
      const response = await fetch('/api/admin/birthday-management')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setStats({
            todayCount: data.data.filter((b: any) => b.daysUntil === 0).length,
            upcomingCount: data.data.filter((b: any) => b.daysUntil > 0 && b.daysUntil <= 7).length,
          })
        }
      }
    } catch (error) {
      // Silent fail - birthday widget is optional
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
          <Cake className="w-5 h-5" />
          Birthday Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Cake className="w-4 h-4 text-pink-500" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Today</p>
            </div>
            <p className="text-2xl font-bold text-pink-600">{stats.todayCount}</p>
            <p className="text-xs text-neutral-500">Birthdays</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Next 7 Days</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.upcomingCount}</p>
            <p className="text-xs text-neutral-500">Upcoming</p>
          </div>
        </div>

        {/* Message */}
        <div className="text-center py-4">
          <Cake className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">
            {stats.upcomingCount > 0 
              ? `${stats.upcomingCount} birthdays coming up this week`
              : 'No upcoming birthdays this week'}
          </p>
          <a 
            href="/admin/birthday-management" 
            className="text-xs text-pink-600 hover:text-pink-700 mt-2 inline-block"
          >
            Manage Birthdays →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
