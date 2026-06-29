import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPageLoader } from '@/components/admin/AdminPageLoader';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Admin Panel — Lakshana Beauty Salon',
  description: 'Admin management panel for Lakshana Premier Beauty Salon',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0F0B16', color: '#F5F0FF' }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <AdminPageLoader />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#0F0B16' }}
        >
          <div className="p-6 min-h-full">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
