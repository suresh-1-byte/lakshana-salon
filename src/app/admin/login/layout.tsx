// Override admin layout for login — render children directly
// (Next.js will nest this inside admin/layout.tsx, but login page manages its own full-page layout)
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#0D0A14', minHeight: '100vh' }}>{children}</div>;
}
