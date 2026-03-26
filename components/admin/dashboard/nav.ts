import {
  Globe,
  ImageIcon,
  LayoutDashboard,
  Share2,
  Upload,
  Users,
  FolderKanban,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

export const mainNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/site', label: 'Site público', icon: Globe },
  { href: '/admin/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/admin/upload', label: 'Upload', icon: Upload },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/compartilhamento', label: 'Compartilhamento', icon: Share2 },
  { href: '/admin/selecao', label: 'Seleção (cliente)', icon: ImageIcon, badge: 'Novo' },
]

export const secondaryNav: NavItem[] = [
  { href: '/admin/ferramentas', label: 'Ferramentas do sistema', icon: Wrench },
]
