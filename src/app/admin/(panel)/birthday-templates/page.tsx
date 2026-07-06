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
import { Plus, Edit, Trash2, Star, Cake } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import BirthdayTemplateForm from '@/components/admin/BirthdayTemplateForm'

type BirthdayTemplate = {
  id: string
  templateName: string
  offerPercentage: number
  offerValidityDays: number
  serviceNames: string[]
  isActive: boolean
  isDefault: boolean
}

export default function BirthdayTemplatesPage() {
  const [templates, setTemplates] = useState<BirthdayTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<BirthdayTemplate | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/birthday-templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.templates)
      } else {
        throw new Error(data.error || 'Failed to load templates')
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load birthday templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return

    try {
      const response = await fetch(`/api/admin/birthday-templates?id=${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        })
        loadTemplates()
      } else {
        throw new Error(data.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (template: BirthdayTemplate) => {
    setSelectedTemplate(template)
    setShowForm(true)
  }

  const handleCreate = () => {
    setSelectedTemplate(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cake className="w-8 h-8 text-pink-500" />
            Birthday Templates
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage birthday offer message templates
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No templates found. Create your first one!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {template.isDefault && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <span className="font-medium">{template.templateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                        {template.offerPercentage}% OFF
                      </Badge>
                    </TableCell>
                    <TableCell>{template.offerValidityDays} days</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-neutral-600">
                        {template.serviceNames.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id, template.templateName)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <BirthdayTemplateForm
            template={selectedTemplate}
            onSuccess={() => {
              setShowForm(false)
              loadTemplates()
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
