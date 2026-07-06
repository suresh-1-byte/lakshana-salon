'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cake, Send, Calendar, Gift, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type BirthdayNotification = {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  birthdayDate: string
  daysUntilBirthday: number
  offerSent: boolean
}

export default function BirthdayWidget() {
  const [stats, setStats] = useState({
    todayCount: 0,
    upcomingCount: 0,
    messagesSentThisWeek: 0,
    pendingWishes: 0,
  })
  const [notifications, setNotifications] = useState<BirthdayNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadData()
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statsResponse, notificationsResponse] = await Promise.all([
        fetch('/api/admin/birthdays?action=statistics'),
        fetch('/api/admin/birthdays?action=pending-notifications'),
      ])
      
      const statsData = await statsResponse.json()
      const notificationsData = await notificationsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.stats)
      }
      if (notificationsData.success) {
        setNotifications(notificationsData.notifications)
      }
    } catch (error) {
      console.error('Error loading birthday data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOffer = async (notificationId: string, customerName: string) => {
    try {
      setSendingId(notificationId)
      const response = await fetch('/api/admin/birthdays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-offer', customerId: notificationId }),
      })
      
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: `Birthday offer sent to ${customerName}`,
        })
        loadData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send offer',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error sending offer:', error)
      toast({
        title: 'Error',
        description: 'Failed to send offer',
        variant: 'destructive',
      })
    } finally {
      setSendingId(null)
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
    <>
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

            <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-4 h-4 text-green-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Sent</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.messagesSentThisWeek}</p>
              <p className="text-xs text-neutral-500">This week</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Pending</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingWishes}</p>
              <p className="text-xs text-neutral-500">Need action</p>
            </div>
          </div>

          {/* Upcoming Notifications */}
          {notifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Pending Birthday Offers ({notifications.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border border-pink-100 dark:border-pink-900/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(notification.birthdayDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Badge>
                          <Badge variant={notification.daysRemaining === 0 ? 'default' : 'outline'} className="text-xs">
                            {notification.daysRemaining === 0 
                              ? 'Today!' 
                              : notification.daysRemaining === 1
                              ? 'Tomorrow'
                              : `${notification.daysRemaining} days`}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {notification.offerPercentage}% off • Valid till {new Date(notification.offerValidUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendOffer(notification.id, notification.customerName || '')}
                        disabled={sendingId === notification.id}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        {sendingId === notification.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1" />
                            Send
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="w-full text-xs text-pink-600 hover:text-pink-700"
                >
                  View all {notifications.length} pending offers
                </Button>
              )}
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-6">
              <Cake className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No pending birthday offers</p>
              <p className="text-xs text-neutral-400 mt-1">
                {stats.upcomingCount > 0 
                  ? `${stats.upcomingCount} upcoming in the next week`
                  : 'All caught up!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Notifications Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Pending Birthday Offers</DialogTitle>
            <DialogDescription>
              Send birthday offers to customers with upcoming birthdays
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <Cake className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium">{notification.customerName}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {notification.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge>
                      Birthday: {new Date(notification.birthdayDate).toLocaleDateString()}
                    </Badge>
                    <Badge variant={notification.daysRemaining === 0 ? 'default' : 'secondary'}>
                      {notification.daysRemaining === 0 
                        ? 'Today!' 
                        : `${notification.daysRemaining} days left`}
                    </Badge>
                    <Badge variant="outline">
                      {notification.offerPercentage}% OFF
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Offer valid until {new Date(notification.offerValidUntil).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleSendOffer(notification.id, notification.customerName || '')}
                  disabled={sendingId === notification.id}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {sendingId === notification.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Offer
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
