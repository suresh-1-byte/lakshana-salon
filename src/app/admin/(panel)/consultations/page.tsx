'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Eye, Trash2, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import ConsultationForm from '@/components/admin/ConsultationForm'
import type { Consultation } from '@/types/admin'

// Fetch consultations from API
async function fetchConsultations(filters?: { customerId?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.customerId) params.append('customerId', filters.customerId);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`/api/admin/consultations?${params.toString()}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch consultations');
  }
  
  return data.data;
}

// Delete consultation via API
async function deleteConsultationAPI(id: string) {
  const response = await fetch(`/api/admin/consultations?id=${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete consultation');
  }
  
  return data;
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filterReminders, setFilterReminders] = useState<'all' | 'pending' | 'overdue'>('all')

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const data = await fetchConsultations()
      setConsultations(data)
    } catch (error) {
      console.error('Error loading consultations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load consultations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return

    try {
      await deleteConsultationAPI(id)
      toast({
        title: 'Success',
        description: 'Consultation deleted successfully',
      })
      loadConsultations()
    } catch (error) {
      console.error('Error deleting consultation:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete consultation',
        variant: 'destructive',
      })
    }
  }

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setShowDetails(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      scheduled: 'secondary',
      cancelled: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    )
  }

  const getReminderStatus = (consultation: Consultation) => {
    if (!consultation.reminderDate) return null;
    
    const reminderDate = new Date(consultation.reminderDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);
    
    if (reminderDate < today && !consultation.reminderSent) {
      return { status: 'overdue', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    } else if (reminderDate <= today && !consultation.reminderSent) {
      return { status: 'due', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    } else if (!consultation.reminderSent) {
      return { status: 'pending', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }
    return { status: 'sent', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
  }

  const filteredConsultations = consultations.filter(c => {
    if (filterReminders === 'all') return true;
    
    const reminderStatus = getReminderStatus(c);
    if (filterReminders === 'pending' && reminderStatus && !c.reminderSent) return true;
    if (filterReminders === 'overdue' && reminderStatus?.status === 'overdue') return true;
    
    return false;
  });

  const pendingRemindersCount = consultations.filter(c => {
    const status = getReminderStatus(c);
    return status && !c.reminderSent;
  }).length;

  const overdueRemindersCount = consultations.filter(c => {
    const status = getReminderStatus(c);
    return status?.status === 'overdue';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultations</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage customer hair & skin consultations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Consultation
        </Button>
      </div>

      {/* Reminder Stats */}
      {(pendingRemindersCount > 0 || overdueRemindersCount > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {overdueRemindersCount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {overdueRemindersCount} Overdue Reminder{overdueRemindersCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    Follow up needed
                  </p>
                </div>
              </div>
            </div>
          )}
          {pendingRemindersCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {pendingRemindersCount} Pending Reminder{pendingRemindersCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Scheduled for follow up
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filterReminders === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterReminders('all')}
        >
          All ({consultations.length})
        </Button>
        <Button
          variant={filterReminders === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterReminders('pending')}
        >
          <Calendar className="w-3 h-3 mr-1" />
          Pending Reminders ({pendingRemindersCount})
        </Button>
        <Button
          variant={filterReminders === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterReminders('overdue')}
          className={overdueRemindersCount > 0 ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
        >
          Overdue ({overdueRemindersCount})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filterReminders === 'all' && `All Consultations (${filteredConsultations.length})`}
            {filterReminders === 'pending' && `Pending Reminders (${filteredConsultations.length})`}
            {filterReminders === 'overdue' && `Overdue Reminders (${filteredConsultations.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading consultations...</div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {filterReminders === 'all' && 'No consultations found. Create your first one!'}
              {filterReminders === 'pending' && 'No pending reminders'}
              {filterReminders === 'overdue' && 'No overdue reminders'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Hair Type</TableHead>
                  <TableHead>Skin Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultations.map((consultation) => {
                  const reminderStatus = getReminderStatus(consultation);
                  return (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        {new Date(consultation.consultationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {consultation.customerName || 'N/A'}
                      </TableCell>
                      <TableCell>{consultation.consultantName || 'N/A'}</TableCell>
                      <TableCell>{consultation.hairType || '-'}</TableCell>
                      <TableCell>{consultation.skinType || '-'}</TableCell>
                      <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                      <TableCell>
                        {reminderStatus && consultation.reminderDate ? (
                          <div className={`flex items-center gap-1 text-xs ${reminderStatus.color}`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(consultation.reminderDate).toLocaleDateString()}
                            </span>
                            {reminderStatus.status === 'overdue' && (
                              <Badge variant="destructive" className="ml-1 text-[10px] py-0 px-1">
                                Overdue
                              </Badge>
                            )}
                            {reminderStatus.status === 'sent' && (
                              <Badge variant="default" className="ml-1 text-[10px] py-0 px-1 bg-green-500">
                                Sent
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">No reminder</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(consultation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(consultation.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Consultation Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Consultation</DialogTitle>
          </DialogHeader>
          <ConsultationForm
            onSuccess={() => {
              setShowForm(false)
              loadConsultations()
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Consultation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedConsultation.consultationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Status</p>
                  {getStatusBadge(selectedConsultation.status)}
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Hair Type</p>
                  <p className="font-medium">{selectedConsultation.hairType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Skin Type</p>
                  <p className="font-medium">{selectedConsultation.skinType || '-'}</p>
                </div>
              </div>

              {selectedConsultation.problems && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Problems</p>
                  <p className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                    {selectedConsultation.problems}
                  </p>
                </div>
              )}

              {selectedConsultation.suggestions && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Suggestions</p>
                  <p className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                    {selectedConsultation.suggestions}
                  </p>
                </div>
              )}

              {selectedConsultation.recommendedServices && selectedConsultation.recommendedServices.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">Recommended Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.recommendedServices.map((service, idx) => (
                      <Badge key={idx} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation.recommendedProducts && selectedConsultation.recommendedProducts.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">Recommended Products</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.recommendedProducts.map((product, idx) => (
                      <Badge key={idx} variant="outline">{product}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation.nextVisit && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Next Visit Scheduled</p>
                      <p className="text-sm">
                        {new Date(selectedConsultation.nextVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedConsultation.reminderDate && (
                <div className={`p-4 rounded-lg ${getReminderStatus(selectedConsultation)?.bg || 'bg-neutral-100 dark:bg-neutral-800'}`}>
                  <div className={`flex items-center gap-2 ${getReminderStatus(selectedConsultation)?.color || 'text-neutral-700 dark:text-neutral-400'}`}>
                    <Calendar className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        Follow-up Reminder
                        {getReminderStatus(selectedConsultation)?.status === 'overdue' && (
                          <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                        )}
                        {selectedConsultation.reminderSent && (
                          <Badge variant="default" className="text-[10px] bg-green-500">Sent</Badge>
                        )}
                      </p>
                      <p className="text-sm">
                        {new Date(selectedConsultation.reminderDate).toLocaleDateString()}
                      </p>
                      {selectedConsultation.reminderNotes && (
                        <p className="text-xs mt-1 opacity-80">
                          {selectedConsultation.reminderNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
