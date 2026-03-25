import { AdminLayoutClient } from '@/components/admin/dashboard/AdminLayoutClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
