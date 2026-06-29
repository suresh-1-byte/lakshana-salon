'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Mail, MessageCircle, Smartphone, Clock, Plus, Trash2, RefreshCw, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Notification } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const TEMPLATES = [
  {
    label: '🌸 Festival Offer',
    title: '🌸 Festival Special — 20% Off All Services!',
    body: 'Celebrate the festivities with a treat for yourself! Enjoy 20% off on all services this week at Lakshana Premier Beauty Salon. Book your appointment today.',
  },
  {
    label: '💄 New Service',
    title: '✨ Exciting New Service Alert!',
    body: "We've just launched a brand-new service at Lakshana Beauty Salon! Be among the first to experience our latest beauty treatment. Limited slots available — book now!",
  },
  {
    label: '⭐ Loyalty Reward',
    title: '👑 You\'ve Earned a Loyalty Reward!',
    body: 'Thank you for being a valued customer. As a loyalty member, you\'ve unlocked an exclusive reward. Visit us this month to redeem it.',
  },
  {
    label: '📅 Reminder',
    title: '📅 Don\'t Forget Your Self-Care!',
    body: "It's been a while since your last visit. We miss you at Lakshana Beauty Salon! Book your next appointment and let us pamper you.",
  },
  {
    label: '🎂 Birthday Special',
    title: '🎂 Happy Birthday from Lakshana Beauty!',
    body: 'Wishing you a wonderful birthday! As our gift to you, enjoy a special discount on your birthday visit. Celebrate your special day with us!',
  },
  {
    label: '🏷️ Weekend Deal',
    title: '🏷️ Weekend Special — Book Now!',
    body: 'Make your weekend extra special! Enjoy exclusive weekend pricing on select services at Lakshana Premier Beauty Salon. Offer valid Saturday & Sunday only.',
  },
];

const CHANNEL_INFO = [
  { id: 'push',     label: 'Browser Push',  icon: Smartphone,     desc: 'Instant notification to all subscribed browsers' },
  { id: 'email',    label: 'Email',         icon: Mail,           desc: 'Send via Resend to specified email addresses' },
  { id: 'telegram', label: 'Telegram',      icon: MessageCircle,  desc: 'Send to your configured Telegram bot/channel' },
];

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending]   = useState(false);

  const [form, setForm] = useState({
    title: '', body: '', types: ['push'] as string[],
    targetUrl: '/', email: '', scheduledAt: '',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/notifications');
    const data = await res.json();
    if (data.success) setNotifications(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const deleteNotification = async (id: string) => {
    const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    if (res.ok) { toast({ title: 'Notification deleted' }); fetchNotifications(); }
  };

  const clearAll = async () => {
    if (!confirm(`Delete all ${notifications.length} notifications? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/notifications/clear', { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { toast({ title: `Cleared ${data.deleted} notifications` }); fetchNotifications(); }
    else toast({ title: 'Failed to clear', variant: 'destructive' });
  };

  const toggleChannel = (ch: string) => {
    setForm(p => ({
      ...p,
      types: p.types.includes(ch) ? p.types.filter(t => t !== ch) : [...p.types, ch],
    }));
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setForm(p => ({ ...p, title: tpl.title, body: tpl.body }));
    toast({ title: `Template applied: ${tpl.label}` });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: 'Title and body are required', variant: 'destructive' }); return;
    }
    if (form.types.length === 0) {
      toast({ title: 'Select at least one notification channel', variant: 'destructive' }); return;
    }
    if (form.types.includes('email') && !form.email.trim()) {
      toast({ title: 'Enter recipient email address(es)', variant: 'destructive' }); return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          types: form.types,
          targetUrl: form.targetUrl || '/',
          email: form.email,
          scheduledAt: form.scheduledAt || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: form.scheduledAt ? '⏰ Notification scheduled!' : '✅ Notification sent!' });
        setSendOpen(false);
        setForm({ title:'', body:'', types:['push'], targetUrl:'/', email:'', scheduledAt:'' });
        fetchNotifications();
      } else {
        toast({ title: data.error || 'Send failed', variant: 'destructive' });
      }
    } catch { toast({ title: 'Connection error', variant: 'destructive' }); }
    setSending(false);
  };

  const sentCount      = notifications.filter(n => n.status === 'sent').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;

  const columns = [
    {
      key: 'title' as keyof Notification,
      label: 'Notification',
      render: (n: Notification) => (
        <div>
          <p className="text-white text-sm font-medium line-clamp-1">{n.title}</p>
          <p className="text-white/35 text-[11px] mt-0.5 line-clamp-1">{n.body}</p>
        </div>
      ),
    },
    {
      key: 'type' as keyof Notification,
      label: 'Channels',
      render: (n: Notification) => (
        <div className="flex gap-1 flex-wrap">
          {n.type?.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(212,68,122,0.15)', color: '#D4447A' }}>
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status' as keyof Notification,
      label: 'Status',
      render: (n: Notification) => <StatusBadge status={n.status} />,
    },
    {
      key: 'sentAt' as keyof Notification,
      label: 'Sent At',
      render: (n: Notification) => (
        <span className="text-white/35 text-[11px]">
          {n.sentAt
            ? new Date(n.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
            : n.scheduledAt
              ? <span className="text-yellow-400/70 flex items-center gap-1"><Clock size={10} /> {new Date(n.scheduledAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              : '—'
          }
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof Notification,
      label: 'Created',
      render: (n: Notification) => (
        <span className="text-white/20 text-[11px]">
          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'id' as keyof Notification,
      label: '',
      render: (n: Notification) => (
        <button
          onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sent',  value: sentCount,             color: '#22C55E', icon: CheckCircle2 },
          { label: 'Scheduled',   value: scheduledCount,        color: '#EAB308', icon: Clock },
          { label: 'Total',       value: notifications.length,  color: '#D4447A', icon: Bell },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</p>
              <p className="text-white/25 text-[9px] uppercase tracking-[0.3em]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={fetchNotifications}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 bg-white/[0.05]">
            <RefreshCw size={13} />
          </button>
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="h-9 px-4 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/10 transition-all">
              <Trash2 size={13} /> Clear All ({notifications.length})
            </button>
          )}
        </div>
        <button onClick={() => setSendOpen(true)}
          className="h-10 px-5 rounded-xl flex items-center gap-2 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.3)' }}>
          <Bell size={14} /> New Notification
        </button>
      </div>

      <AdminTable columns={columns} data={notifications} loading={loading} emptyMessage="No notifications sent yet" />

      {/* Send Modal */}
      <AdminModal open={sendOpen} onClose={() => setSendOpen(false)} title="Send Notification" size="lg">
        <form onSubmit={handleSend} className="space-y-5">

          {/* Templates */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-3">
              <Sparkles size={10} className="inline mr-1.5" />Quick Templates
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map(tpl => (
                <button type="button" key={tpl.label} onClick={() => applyTemplate(tpl)}
                  className="px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02] hover:bg-[rgba(212,68,122,0.12)]"
                  style={{ background: 'rgba(212,68,122,0.06)', border: '1px solid rgba(212,68,122,0.12)' }}>
                  <p className="text-white/70 text-xs font-medium">{tpl.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(212,68,122,0.1)' }} />

          {/* Title + Body */}
          <AdminInput label="Title *" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required placeholder="Notification title..." />
          <AdminTextarea label="Message *" value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            required placeholder="Notification message body..." />

          {/* Channels */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4447A] mb-3">Channels</p>
            <div className="grid grid-cols-3 gap-3">
              {CHANNEL_INFO.map(ch => (
                <button type="button" key={ch.id} onClick={() => toggleChannel(ch.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                  style={form.types.includes(ch.id)
                    ? { background: 'rgba(212,68,122,0.18)', border: '1px solid rgba(212,68,122,0.45)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                  }>
                  <ch.icon size={20} style={{ color: form.types.includes(ch.id) ? '#D4447A' : 'rgba(255,255,255,0.3)' }} />
                  <p className="text-xs font-medium" style={{ color: form.types.includes(ch.id) ? '#D4447A' : 'rgba(255,255,255,0.5)' }}>
                    {ch.label}
                  </p>
                  <p className="text-[10px] text-white/25 text-center leading-tight">{ch.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Email recipients */}
          {form.types.includes('email') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <AdminInput label="Email Recipients (comma separated)"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="client@email.com, another@email.com"
                hint="Separate multiple emails with commas" />
            </motion.div>
          )}

          {/* Target URL + Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Target URL (for push click)"
              value={form.targetUrl} onChange={e => setForm(p => ({ ...p, targetUrl: e.target.value }))}
              placeholder="/" hint="Where should the notification link to?" />
            <AdminInput label="Schedule For (optional)"
              type="datetime-local" value={form.scheduledAt}
              onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
              hint="Leave empty to send immediately" />
          </div>

          {/* Preview */}
          {(form.title || form.body) && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(212,68,122,0.06)', border: '1px solid rgba(212,68,122,0.15)' }}>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4447A] font-bold mb-2">Preview</p>
              <p className="text-white/80 text-sm font-medium">{form.title || 'Title...'}</p>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">{form.body || 'Body...'}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSendOpen(false)}
              className="flex-1 h-11 rounded-xl text-white/50 text-sm border border-white/10 hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={sending}
              className="flex-1 h-11 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.3)' }}>
              {sending
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending...</>
                : form.scheduledAt
                  ? <><Clock size={14} />Schedule</>
                  : <><Send size={14} />Send Now</>
              }
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
