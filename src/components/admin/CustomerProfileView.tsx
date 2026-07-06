'use client';

// ═══════════════════════════════════════════════════════
//  Customer Profile View Component
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Phone, Mail, MapPin, Calendar, CreditCard, 
  Package, Activity, MessageSquare, Edit, Trash2, 
  RotateCcw, Gift, Clock, IndianRupee 
} from 'lucide-react';
import type { CustomerProfile, WhatsAppMessage } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatCurrency } from '@/lib/utils';
import WhatsAppDialog from './WhatsAppDialog';
import CustomerEditDialog from './CustomerEditDialog';
import CustomerDeleteDialog from './CustomerDeleteDialog';

interface CustomerProfileViewProps {
  profile: CustomerProfile;
  messageHistory: WhatsAppMessage[];
}

export default function CustomerProfileView({ 
  profile, 
  messageHistory 
}: CustomerProfileViewProps) {
  const router = useRouter();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {profile.name}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Customer since {formatDate(profile.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowWhatsApp(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={() => setShowEdit(true)}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {profile.isDeleted ? (
            <Button
              onClick={() => setShowDelete(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          ) : (
            <Button
              onClick={() => setShowDelete(true)}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Visits</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {profile.totalVisits}
                </p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Spent</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  ₹{profile.totalSpent.toLocaleString()}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Loyalty Status</p>
                <p className="text-2xl font-bold text-amber-600">
                  {profile.loyaltyStatus}
                </p>
              </div>
              <Gift className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Visit</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile.lastVisit ? formatDate(profile.lastVisit) : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                  <p className="font-semibold">{profile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">WhatsApp</p>
                  <p className="font-semibold">{profile.whatsappNumber || profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                  <p className="font-semibold">{profile.email || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Date of Birth</p>
                  <p className="font-semibold">
                    {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Address</p>
                  <p className="font-semibold">{profile.address || 'Not provided'}</p>
                </div>
              </div>

              {profile.notes && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Notes</p>
                  <p className="text-sm">{profile.notes}</p>
                </div>
              )}
            </div>
          </div>

          {profile.membership && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-lg font-semibold mb-3">Membership</h3>
                <div className="flex items-center gap-4">
                  <Badge className="bg-amber-600 text-white text-lg px-4 py-2">
                    {profile.membership.tier} Member
                  </Badge>
                  <div className="text-sm text-neutral-600">
                    Valid until {formatDate(profile.membership.expiryDate)}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({profile.bookings.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({profile.payments.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({profile.appointments.length})</TabsTrigger>
          <TabsTrigger value="packages">Packages ({profile.packages.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({messageHistory.length})</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.type === 'payment' ? 'bg-green-100 text-green-600' :
                        event.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'appointment' ? 'bg-purple-100 text-purple-600' :
                        event.type === 'package' ? 'bg-amber-100 text-amber-600' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {event.type === 'payment' && <CreditCard className="h-5 w-5" />}
                        {event.type === 'booking' && <Calendar className="h-5 w-5" />}
                        {event.type === 'appointment' && <Clock className="h-5 w-5" />}
                        {event.type === 'package' && <Package className="h-5 w-5" />}
                        {event.type === 'membership' && <Gift className="h-5 w-5" />}
                      </div>
                      {index < profile.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-neutral-200 dark:bg-neutral-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{event.title}</h4>
                        <span className="text-sm text-neutral-600">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                      )}
                      {event.amount && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          ₹{event.amount.toLocaleString()}
                        </p>
                      )}
                      {event.status && (
                        <Badge variant="outline" className="mt-2">
                          {event.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content... */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bookings.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {profile.bookings.map(booking => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{booking.services.length} Service(s)</span>
                        <Badge variant={
                          booking.status === 'completed' ? 'default' :
                          booking.status === 'confirmed' ? 'secondary' :
                          booking.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {formatDate(booking.createdAt)}
                      </p>
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
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.payments.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {profile.payments.map(payment => (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Invoice #{payment.invoiceNumber}</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{payment.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>{formatDate(payment.createdAt)}</span>
                        <Badge>{payment.status}</Badge>
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
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.appointments.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">No appointments yet</p>
              ) : (
                <div className="space-y-3">
                  {profile.appointments.map(appointment => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{appointment.appointmentType}</span>
                        <Badge>{appointment.status}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                      </p>
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
              <CardTitle>Packages</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.packages.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">No packages purchased</p>
              ) : (
                <div className="space-y-3">
                  {profile.packages.map(pkg => (
                    <div key={pkg.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{pkg.packageName}</span>
                        <Badge>{pkg.status}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {pkg.remainingSessions}/{pkg.totalSessions} sessions remaining
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Expires: {formatDate(pkg.expiryDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messageHistory.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {messageHistory.map(message => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          message.deliveryStatus === 'delivered' ? 'default' :
                          message.deliveryStatus === 'sent' ? 'secondary' :
                          message.deliveryStatus === 'failed' ? 'destructive' :
                          'outline'
                        }>
                          {message.deliveryStatus}
                        </Badge>
                        <span className="text-sm text-neutral-600">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showWhatsApp && (
        <WhatsAppDialog
          customer={{
            id: profile.id,
            name: profile.name,
            phone: profile.whatsappNumber || profile.phone,
          }}
          onClose={() => {
            setShowWhatsApp(false);
            handleRefresh();
          }}
        />
      )}

      {showEdit && (
        <CustomerEditDialog
          customer={profile}
          onClose={() => {
            setShowEdit(false);
            handleRefresh();
          }}
        />
      )}

      {showDelete && (
        <CustomerDeleteDialog
          customer={profile}
          isDeleted={profile.isDeleted || false}
          onClose={() => {
            setShowDelete(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
