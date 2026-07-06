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

      <Card>
        <CardHeader>
          <CardTitle>All Consultations ({consultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading consultations...</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No consultations found. Create your first one!
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
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
                ))}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
