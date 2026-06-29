interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: 'rgba(234,179,8,0.15)',  text: '#EAB308', dot: '#EAB308' },
  confirmed:  { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', dot: '#22C55E' },
  completed:  { bg: 'rgba(99,102,241,0.15)', text: '#818CF8', dot: '#818CF8' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', dot: '#EF4444' },
  rescheduled:{ bg: 'rgba(249,115,22,0.15)', text: '#F97316', dot: '#F97316' },
  approved:   { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', dot: '#22C55E' },
  rejected:   { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', dot: '#EF4444' },
  paid:       { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', dot: '#22C55E' },
  unpaid:     { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', dot: '#EF4444' },
  partial:    { bg: 'rgba(249,115,22,0.15)', text: '#F97316', dot: '#F97316' },
  active:     { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', dot: '#22C55E' },
  inactive:   { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', dot: '#EF4444' },
  sent:       { bg: 'rgba(99,102,241,0.15)', text: '#818CF8', dot: '#818CF8' },
  draft:      { bg: 'rgba(148,163,184,0.15)',text: '#94A3B8', dot: '#94A3B8' },
  scheduled:  { bg: 'rgba(234,179,8,0.15)',  text: '#EAB308', dot: '#EAB308' },
  Bronze:     { bg: 'rgba(180,120,60,0.15)', text: '#CD7F32', dot: '#CD7F32' },
  Silver:     { bg: 'rgba(192,192,192,0.15)',text: '#C0C0C0', dot: '#C0C0C0' },
  Gold:       { bg: 'rgba(212,175,55,0.15)', text: '#D4AF37', dot: '#D4AF37' },
  Platinum:   { bg: 'rgba(229,228,226,0.15)',text: '#E5E4E2', dot: '#E5E4E2' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8', dot: '#94A3B8' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: style.dot }} />
      {status}
    </span>
  );
}
