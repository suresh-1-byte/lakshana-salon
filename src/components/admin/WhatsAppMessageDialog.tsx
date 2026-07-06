'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Image, FileText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { WhatsAppMessageType } from '@/types/admin'

interface WhatsAppMessageDialogProps {
  customerId: string
  customerName: string
  customerPhone: string
  onMessageSent?: () => void
}

export function WhatsAppMessageDialog({
  customerId,
  customerName,
  customerPhone,
  onMessageSent,
}: WhatsAppMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [messageType, setMessageType] = useState<WhatsAppMessageType>('text')
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          customerName,
          customerPhone,
          messageType,
          content,
          mediaUrl: mediaUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast({
        title: 'Success',
        description: 'WhatsApp message sent successfully',
      })

      setContent('')
      setMediaUrl('')
      setOpen(false)
      onMessageSent?.()
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message</DialogTitle>
          <DialogDescription>
            Send a message to {customerName} ({customerPhone})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Type */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <Select
              value={messageType}
              onValueChange={(value) => setMessageType(value as WhatsAppMessageType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Text Message
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Image
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media URL (for image/document) */}
          {(messageType === 'image' || messageType === 'document') && (
            <div className="space-y-2">
              <Label>Media URL</Label>
              <input
                type="url"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/image.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <p className="text-xs text-neutral-500">
                Provide a public URL to the image or document
              </p>
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Type your message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-neutral-500">
              {content.length} characters
            </p>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent(
                    `Hi ${customerName},\n\nThank you for visiting Lakshana Beauty Salon! We hope you enjoyed your experience.\n\nLooking forward to serving you again! ✨`
                  )
                }
              >
                Thank You
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent(
                    `Hi ${customerName},\n\nThis is a reminder about your appointment tomorrow.\n\nSee you soon! 🌸`
                  )
                }
              >
                Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent(
                    `Hi ${customerName},\n\n🎉 Special offer just for you! Get 20% off on your next visit.\n\nValid for 7 days. Book now! 💝`
                  )
                }
              >
                Special Offer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent(
                    `Hi ${customerName},\n\nYour appointment has been confirmed! ✅\n\nThank you for choosing Lakshana Beauty Salon.`
                  )
                }
              >
                Confirmation
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {sending ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
