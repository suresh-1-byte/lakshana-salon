export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.08)' }}>
        {/* Header */}
        <div className="h-10 px-4 flex items-center gap-4"
          style={{ background: 'rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {[120, 80, 60, 80, 60].map((w, i) => (
            <div key={i} className="h-3 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.07)' }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-14 px-4 flex items-center gap-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-3 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-3 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-5 w-20 rounded-full ml-auto" style={{ background: 'rgba(212,175,55,0.08)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
