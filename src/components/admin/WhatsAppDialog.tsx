'use client';

// ═══════════════════════════════════════════════════════
//  WhatsApp Message Dialog
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Send, FileText, Image as ImageIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface WhatsAppDialogProps {
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  onClose: () => void;
}

const MESSAGE_TEMPLATES = [
  {
    id: 'custom',
    name: 'Custom Message',
    content: '',
  },
  {
    id: 'birthday',
    name: 'Birthday Wishes',
    content: '🎉 Happy Birthday {{name}}! 🎂\n\nWishing you a day filled with joy and beauty! 💐\n\nAs a special gift, enjoy 20% OFF on your next visit.\n\nLakshana Beauty Salon\n✨ Where Beauty Meets Luxury',
  },
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    content: '⏰ Reminder: You have an appointment tomorrow!\n\n📅 Date: [DATE]\n⏰ Time: [TIME]\n💇 Service: [SERVICE]\n\nSee you soon!\nLakshana Beauty Salon',
  },
  {
    id: 'thank_you',
    name: 'Thank You Message',
    content: '🙏 Thank you for visiting Lakshana Beauty Salon!\n\nWe hope you loved your experience. 💖\n\nShare your feedback:\n⭐⭐⭐⭐⭐\n\nLooking forward to serving you again! ✨',
  },
];

export default function WhatsAppDialog({ customer, onClose }: WhatsAppDialogProps) {
  const [template, setTemplate] = useState('custom');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'image' | 'document'>('text');
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    const selected = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (selected) {
      const content = selected.content.replace('{{name}}', customer.name);
      setMessage(content);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          messageType,
          content: message,
          templateName: template !== 'custom' ? template : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Message sent successfully',
        });
        onClose();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            Send WhatsApp Message to {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Message Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESSAGE_TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Type */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={messageType === 'text' ? 'default' : 'outline'}
                onClick={() => setMessageType('text')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                type="button"
                variant={messageType === 'image' ? 'default' : 'outline'}
                onClick={() => setMessageType('image')}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                type="button"
                variant={messageType === 'document' ? 'default' : 'outline'}
                onClick={() => setMessageType('document')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-neutral-600">
              Phone: {customer.phone}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
