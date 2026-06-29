'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Lock, Globe, Clock, Bell, MessageCircle, Mail, TestTube } from 'lucide-react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminInput';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TABS = [
  { id: 'salon',          label: 'Salon Info',       icon: Globe },
  { id: 'hours',          label: 'Business Hours',   icon: Clock },
  { id: 'notifications',  label: 'Notifications',    icon: Bell },
  { id: 'integrations',   label: 'Integrations',     icon: MessageCircle },
  { id: 'security',       label: 'Security',         icon: Lock },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState('salon');
  const [showResend, setShowResend]     = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);

  const [pwdForm, setPwdForm]   = useState({ current: '', newPwd: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingEmail, setTestingEmail]       = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const set = (path: string, value: unknown) => {
    setSettings((prev: any) => {
      const parts = path.split('.');
      const next  = { ...prev };
      let obj     = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast({ title: 'Settings saved successfully!' });
    else toast({ title: 'Failed to save', variant: 'destructive' });
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      toast({ title: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setSavingPwd(true);
    const res = await fetch('/api/admin/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Password updated!' });
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } else {
      toast({ title: data.error || 'Failed', variant: 'destructive' });
    }
    setSavingPwd(false);
  };

  const testTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '✅ Telegram Test',
          body: 'Lakshana Admin Panel — Telegram integration is working!',
          types: ['telegram'],
        }),
      });
      const data = await res.json();
      if (res.ok) toast({ title: 'Telegram test sent!' });
      else toast({ title: data.error || 'Telegram test failed', variant: 'destructive' });
    } catch { toast({ title: 'Test failed', variant: 'destructive' }); }
    setTestingTelegram(false);
  };

  const testEmail = async () => {
    if (!settings?.email) { toast({ title: 'Set salon email first', variant: 'destructive' }); return; }
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '✅ Email Test — Lakshana Beauty',
          body: 'Your Resend email integration is configured correctly.',
          types: ['email'],
          email: settings.email,
        }),
      });
      const data = await res.json();
      if (res.ok) toast({ title: `Test email sent to ${settings.email}` });
      else toast({ title: data.error || 'Email test failed', variant: 'destructive' });
    } catch { toast({ title: 'Test failed', variant: 'destructive' }); }
    setTestingEmail(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-[#D4447A] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-medium transition-all"
            style={tab === t.id
              ? { background: 'rgba(212,68,122,0.2)', border: '1px solid rgba(212,68,122,0.4)', color: '#D4447A' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
            }>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,68,122,0.12)' }}>

        {/* ── Salon Info ── */}
        {tab === 'salon' && settings && (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-5">
              <AdminInput label="Salon Name"
                value={settings.salonName || ''}
                onChange={e => set('salonName', e.target.value)}
                placeholder="Lakshana Premier Beauty Salon" />
              <AdminInput label="Tagline"
                value={settings.tagline || ''}
                onChange={e => set('tagline', e.target.value)}
                placeholder="Nolambur's Finest Sanctuary" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <AdminInput label="Phone" type="tel"
                value={settings.phone || ''}
                onChange={e => set('phone', e.target.value)} />
              <AdminInput label="Email" type="email"
                value={settings.email || ''}
                onChange={e => set('email', e.target.value)} />
            </div>
            <AdminTextarea label="Address"
              value={settings.address || ''}
              onChange={e => set('address', e.target.value)} />
            <div className="grid grid-cols-3 gap-5">
              <AdminInput label="City"
                value={settings.city || ''}
                onChange={e => set('city', e.target.value)} />
              <AdminInput label="State"
                value={settings.state || ''}
                onChange={e => set('state', e.target.value)} />
              <AdminInput label="Pincode"
                value={settings.pincode || ''}
                onChange={e => set('pincode', e.target.value)} />
            </div>
            <AdminInput label="GST Number (optional)"
              value={settings.gstNumber || ''}
              onChange={e => set('gstNumber', e.target.value)} />

            <div className="pt-2">
              <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold mb-4">Social Links</p>
              <div className="grid grid-cols-2 gap-4">
                <AdminInput label="Instagram"
                  value={settings.socialLinks?.instagram || ''}
                  onChange={e => set('socialLinks.instagram', e.target.value)}
                  placeholder="https://instagram.com/..." />
                <AdminInput label="Facebook"
                  value={settings.socialLinks?.facebook || ''}
                  onChange={e => set('socialLinks.facebook', e.target.value)}
                  placeholder="https://facebook.com/..." />
                <AdminInput label="YouTube"
                  value={settings.socialLinks?.youtube || ''}
                  onChange={e => set('socialLinks.youtube', e.target.value)}
                  placeholder="https://youtube.com/..." />
                <AdminInput label="WhatsApp Number"
                  value={settings.socialLinks?.whatsapp || ''}
                  onChange={e => set('socialLinks.whatsapp', e.target.value)}
                  placeholder="+91 90000 00000" />
              </div>
            </div>
          </div>
        )}

        {/* ── Business Hours ── */}
        {tab === 'hours' && settings?.businessHours && (
          <div className="space-y-3 max-w-xl">
            {DAYS.map(day => {
              const h = settings.businessHours[day] || { open: '09:00', close: '20:00', closed: false };
              return (
                <div key={day}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-28 shrink-0">
                    <p className="text-white/70 text-sm font-medium">{day}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <div className="relative w-10 h-5">
                      <input type="checkbox"
                        checked={!h.closed}
                        onChange={e => set(`businessHours.${day}.closed`, !e.target.checked)}
                        className="sr-only peer" />
                      <div className="w-10 h-5 rounded-full transition-all duration-200 peer-checked:bg-[#D4447A] bg-white/10" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 peer-checked:translate-x-5" />
                    </div>
                    <span className={`text-xs font-medium ${h.closed ? 'text-red-400' : 'text-green-400'}`}>
                      {h.closed ? 'Closed' : 'Open'}
                    </span>
                  </label>
                  {!h.closed && (
                    <div className="flex items-center gap-3">
                      <input type="time" value={h.open}
                        onChange={e => set(`businessHours.${day}.open`, e.target.value)}
                        className="h-8 rounded-lg px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.4)]" />
                      <span className="text-white/25 text-xs">to</span>
                      <input type="time" value={h.close}
                        onChange={e => set(`businessHours.${day}.close`, e.target.value)}
                        className="h-8 rounded-lg px-3 text-sm text-white border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.4)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === 'notifications' && settings?.notificationSettings && (
          <div className="space-y-3 max-w-lg">
            {[
              { key: 'emailOnBooking',       label: 'Email admin on new booking',      desc: 'Send email alert to salon email when booking received' },
              { key: 'pushOnBooking',         label: 'Browser push on new booking',     desc: 'Send web push notification when new appointment arrives' },
              { key: 'telegramOnBooking',     label: 'Telegram alert on new booking',   desc: 'Forward new booking details to your Telegram bot' },
              { key: 'sendInvoiceEmail',      label: 'Auto-send invoice email',         desc: 'Email invoice to customer after bill is created' },
              { key: 'sendThankYouEmail',     label: 'Auto-send thank you email',       desc: 'Send thank you email after booking is marked completed' },
            ].map(opt => (
              <div key={opt.key}
                className="flex items-center justify-between p-4 rounded-xl group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-1 pr-4">
                  <p className="text-white/80 text-sm font-medium">{opt.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{opt.desc}</p>
                </div>
                <label className="relative w-10 h-5 cursor-pointer shrink-0">
                  <input type="checkbox"
                    checked={settings.notificationSettings[opt.key] ?? false}
                    onChange={e => set(`notificationSettings.${opt.key}`, e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full transition-all duration-200 peer-checked:bg-[#D4447A] bg-white/10" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* ── Integrations ── */}
        {tab === 'integrations' && (
          <div className="space-y-8 max-w-lg">
            {/* Resend */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">
                    <Mail size={11} className="inline mr-1.5" />Resend Email API
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">Get your API key at resend.com</p>
                </div>
                <button onClick={testEmail} disabled={testingEmail}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs text-[#D4447A] border border-[rgba(212,68,122,0.3)] hover:bg-[rgba(212,68,122,0.1)] transition-all disabled:opacity-50">
                  <TestTube size={12} />
                  {testingEmail ? 'Sending...' : 'Test'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showResend ? 'text' : 'password'}
                  value={settings?.resendApiKey || ''}
                  onChange={e => set('resendApiKey', e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full h-11 rounded-xl px-4 pr-12 text-sm text-white placeholder:text-white/25 border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.45)]"
                />
                <button type="button" onClick={() => setShowResend(!showResend)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showResend ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold">
                    <MessageCircle size={11} className="inline mr-1.5" />Telegram Bot
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">Create a bot via @BotFather on Telegram</p>
                </div>
                <button onClick={testTelegram} disabled={testingTelegram}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs text-[#D4447A] border border-[rgba(212,68,122,0.3)] hover:bg-[rgba(212,68,122,0.1)] transition-all disabled:opacity-50">
                  <TestTube size={12} />
                  {testingTelegram ? 'Sending...' : 'Test'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showBotToken ? 'text' : 'password'}
                  value={settings?.telegramBotToken || ''}
                  onChange={e => set('telegramBotToken', e.target.value)}
                  placeholder="1234567890:ABCdefGHI..."
                  className="w-full h-11 rounded-xl px-4 pr-12 text-sm text-white placeholder:text-white/25 border border-white/10 bg-white/[0.05] outline-none focus:border-[rgba(212,68,122,0.45)]"
                />
                <button type="button" onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showBotToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <AdminInput label="Telegram Chat ID"
                value={settings?.telegramChatId || ''}
                onChange={e => set('telegramChatId', e.target.value)}
                placeholder="-100XXXXXXXXXX or @channelname"
                hint="Get your chat ID from @userinfobot or @getidsbot" />
            </div>

            {/* Instructions */}
            <div className="rounded-xl p-4 text-xs space-y-2"
              style={{ background: 'rgba(212,68,122,0.06)', border: '1px solid rgba(212,68,122,0.12)' }}>
              <p className="text-[#D4447A] font-bold uppercase tracking-wide text-[9px]">Setup Instructions</p>
              <p className="text-white/40 leading-relaxed">
                <strong className="text-white/60">Resend:</strong> Sign up at resend.com → API Keys → Create Key → paste above
              </p>
              <p className="text-white/40 leading-relaxed">
                <strong className="text-white/60">Telegram:</strong> Message @BotFather → /newbot → copy token → add bot to your group/channel → get chat ID
              </p>
            </div>
          </div>
        )}

        {/* ── Security ── */}
        {tab === 'security' && (
          <div className="max-w-sm">
            <p className="text-[#D4447A] text-[9px] tracking-[0.4em] uppercase font-bold mb-5">Change Admin Password</p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <AdminInput label="Current Password" type="password"
                value={pwdForm.current}
                onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
                required placeholder="Current password" />
              <AdminInput label="New Password" type="password"
                value={pwdForm.newPwd}
                onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                required placeholder="Minimum 8 characters"
                hint="Use letters, numbers and symbols" />
              <AdminInput label="Confirm New Password" type="password"
                value={pwdForm.confirm}
                onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                required placeholder="Repeat new password" />
              <button type="submit" disabled={savingPwd}
                className="h-10 px-6 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)' }}>
                <Lock size={13} />
                {savingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-8 p-4 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-red-400 text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Security Notes</p>
              <ul className="text-white/35 text-xs space-y-1 list-disc list-inside">
                <li>Sessions expire after 24 hours automatically</li>
                <li>Admin credentials are stored in environment variables</li>
                <li>Never share your login credentials</li>
                <li>Use a strong, unique password for production</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Save button (all tabs except security) */}
      {tab !== 'security' && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="h-10 px-6 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.3)' }}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
