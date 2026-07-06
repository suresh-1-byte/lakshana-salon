'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Heart,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type CustomerProfile = {
  id: string
  name: string
  phone: string
  whatsappNumber?: string
  email?: string
  dateOfBirth?: string
  address?: string
  city?: string
  gender?: string
  totalVisits: number
  totalSpent: number
  memberSince: string
  lastVisit?: string
  status: 'active' | 'deleted'
  membership?: {
    tier: string
    expiryDate: string
  }
  notes?: string
  timeline: Array<{
    id: string
    title: string
    description?: string
    date: string
    amount?: number
    status?: string
  }>
  appointments: Array<{
    id: string
    appointmentType: string
    appointmentDate: string
    appointmentTime: string
    status: string
  }>
  payments: Array<{
    id: string
    invoiceNumber: string
    total: number
    status: string
    createdAt: string
  }>
  consultations: Array<{
    id: string
    consultationDate: string
    problems?: string
    status: string
  }>
  packages: Array<{
    id: string
    packageName: string
    totalSessions: number
    remainingSessions: number
    status: string
  }>
}

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      loadProfile()
    }
  }, [customerId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/customers/${customerId}`)
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        throw new Error(data.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customer profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action can be undone.')) return

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Customer deleted successfully',
        })
        router.push('/admin/customers')
      } else {
        throw new Error(data.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      })
    }
  }

  const handleRestore = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Customer restored successfully',
        })
        loadProfile()
      } else {
        throw new Error(data.error || 'Failed to restore customer')
      }
    } catch (error) {
      console.error('Error restoring customer:', error)
      toast({
        title: 'Error',
        description: 'Failed to restore customer',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-medium">Loading customer profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-medium text-red-500">Customer not found</div>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Customer Profile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile.status === 'deleted' ? (
            <Button onClick={handleRestore} variant="outline">
              Restore Customer
            </Button>
          ) : (
            <>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {profile.status === 'deleted' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <Badge variant="destructive">Deleted Customer</Badge>
        </div>
      )}

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalVisits || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{profile.totalSpent?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Last Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.lastVisit ? new Date(profile.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>

              {profile.whatsappNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">WhatsApp</p>
                    <p className="font-medium">{profile.whatsappNumber}</p>
                  </div>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
              )}

              {profile.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(profile.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {profile.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Address</p>
                    <p className="font-medium">{profile.address}</p>
                    {profile.city && <p className="text-sm text-neutral-500">{profile.city}</p>}
                  </div>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Gender</p>
                    <p className="font-medium">{profile.gender}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile.membership && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-600" />
                  Active Membership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Type</span>
                    <Badge className="bg-amber-600">{profile.membership.tier}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Expires</span>
                    <span className="font-medium">
                      {new Date(profile.membership.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {profile.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {profile.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.timeline.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No activity yet</p>
                  ) : (
                    <div className="space-y-4">
                      {profile.timeline.map((event) => (
                        <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{event.title}</p>
                                {event.description && (
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {event.description}
                                  </p>
                                )}
                                {event.amount && (
                                  <p className="text-sm font-medium text-amber-600 mt-1">
                                    ₹{event.amount.toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-neutral-500">
                                  {new Date(event.date).toLocaleDateString()}
                                </p>
                                {event.status && (
                                  <Badge variant="secondary" className="mt-1">
                                    {event.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments ({profile.appointments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.appointments.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.appointments.map((apt) => (
                        <div key={apt.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{apt.appointmentType}</p>
                              <p className="text-sm text-neutral-500">
                                {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                              </p>
                            </div>
                            <Badge>{apt.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History ({profile.payments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.payments.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No payments</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.payments.map((payment) => (
                        <div key={payment.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">₹{payment.total?.toLocaleString()}</p>
                              <p className="text-sm text-neutral-500">
                                Invoice #{payment.invoiceNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                              <Badge variant="secondary">{payment.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations">
              <Card>
                <CardHeader>
                  <CardTitle>Consultations ({profile.consultations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.consultations.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No consultations</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.consultations.map((consultation) => (
                        <div key={consultation.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {new Date(consultation.consultationDate).toLocaleDateString()}
                            </p>
                            <Badge>{consultation.status}</Badge>
                          </div>
                          {consultation.problems && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {consultation.problems}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packages">
              <Card>
                <CardHeader>
                  <CardTitle>Packages ({profile.packages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.packages.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No packages</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.packages.map((pkg) => (
                        <div key={pkg.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{pkg.packageName}</p>
                            <Badge>{pkg.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Sessions</span>
                            <span className="font-medium">
                              {pkg.remainingSessions} / {pkg.totalSessions} remaining
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
