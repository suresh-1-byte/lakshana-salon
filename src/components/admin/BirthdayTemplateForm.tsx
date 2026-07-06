'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

type BirthdayTemplate = {
  id: string
  templateName: string
  messageText?: string
  offerPercentage: number
  offerValidityDays: number
  serviceNames: string[]
  couponCodePrefix?: string
  isActive: boolean
  isDefault: boolean
}

const templateSchema = z.object({
  templateName: z.string().min(3, 'Template name is required'),
  messageText: z.string().min(10, 'Message text is required'),
  offerPercentage: z.number().min(1).max(100),
  offerValidityDays: z.number().min(1).max(365),
  serviceNames: z.string().min(1, 'At least one service is required'),
  couponCodePrefix: z.string().min(2, 'Coupon code prefix is required'),
  isActive: z.boolean(),
  isDefault: z.boolean(),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface BirthdayTemplateFormProps {
  template?: BirthdayTemplate | null
  onSuccess: () => void
  onCancel: () => void
}

export default function BirthdayTemplateForm({ template, onSuccess, onCancel }: BirthdayTemplateFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: template?.templateName || '',
      messageText: template?.messageText || '',
      offerPercentage: template?.offerPercentage || 20,
      offerValidityDays: template?.offerValidityDays || 7,
      serviceNames: template?.serviceNames?.join(', ') || '',
      couponCodePrefix: template?.couponCodePrefix || 'BDAY',
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
    },
  })

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      setLoading(true)

      const serviceNamesArray = data.serviceNames
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const templateData: Partial<BirthdayTemplate> = {
        ...(template?.id && { id: template.id }),
        templateName: data.templateName,
        messageText: data.messageText,
        offerPercentage: data.offerPercentage,
        offerValidityDays: data.offerValidityDays,
        serviceNames: serviceNamesArray,
        couponCodePrefix: data.couponCodePrefix,
        isActive: data.isActive,
        isDefault: data.isDefault,
      }

      const response = await fetch('/api/admin/birthday-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      })
      
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: template ? 'Template updated successfully' : 'Template created successfully',
        })
        onSuccess()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const variables = [
    { name: '{{name}}', description: 'Customer name' },
    { name: '{{birthday_date}}', description: 'Birthday date (formatted)' },
    { name: '{{offer_percentage}}', description: 'Offer percentage' },
    { name: '{{services}}', description: 'Service names' },
    { name: '{{coupon_code}}', description: 'Generated coupon code' },
    { name: '{{valid_until}}', description: 'Offer expiry date' },
    { name: '{{validity_days}}', description: 'Number of validity days' },
    { name: '{{age}}', description: 'Customer age' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="templateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Premium Birthday Offer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="offerPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Percentage *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Discount percentage (1-100)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offerValidityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validity Days *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Days offer is valid</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serviceNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applicable Services *</FormLabel>
              <FormControl>
                <Input placeholder="Hair Spa, Facial, Hair Coloring" {...field} />
              </FormControl>
              <FormDescription>Separate multiple services with commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="couponCodePrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code Prefix *</FormLabel>
              <FormControl>
                <Input placeholder="BDAY" {...field} maxLength={10} />
              </FormControl>
              <FormDescription>
                Will generate codes like: {field.value || 'BDAY'}252025 (prefix + age + year)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="messageText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Template *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Hi {{name}} 🎉..."
                  {...field}
                  rows={8}
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormDescription>
                Use variables to personalize the message
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variable Reference */}
        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">Available Variables:</p>
          <div className="grid grid-cols-2 gap-2">
            {variables.map((variable) => (
              <div key={variable.name} className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">
                  {variable.name}
                </Badge>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {variable.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="mt-2">Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="mt-2">Set as Default</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-pink-500 hover:bg-pink-600">
            {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
