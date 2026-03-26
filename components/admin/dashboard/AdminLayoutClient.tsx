'use client'

import { usePathname } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'
import { AdminShell } from './AdminShell'

function matchRoute(pathname: string): { title: string; subtitle?: string } {
  if (pathname === '/admin' || pathname === '/admin/') {
    return { title: 'Dashboard', subtitle: 'Visão geral do seu estúdio' }
  }
  if (pathname === '/admin/site') {
    return {
      title: 'Site público',
      subtitle: 'Hero, portfólio, depoimentos, contato, sobre e redes — por abas',
    }
  }
  if (pathname === '/admin/projetos') {
    return { title: 'Projetos', subtitle: 'Eventos, entregas e arquivos' }
  }
  if (pathname === '/admin/projetos/novo') {
    return { title: 'Novo projeto', subtitle: 'Cliente e dados do evento' }
  }
  if (pathname.startsWith('/admin/projetos/')) {
    return { title: 'Projeto', subtitle: 'Galeria e gestão de mídia' }
  }
  if (pathname === '/admin/upload') {
    return { title: 'Upload', subtitle: 'Fotos no R2 · vídeos via Google Drive' }
  }
  if (pathname === '/admin/clientes') {
    return { title: 'Clientes', subtitle: 'Contatos e acessos' }
  }
  if (pathname === '/admin/clientes/novo') {
    return { title: 'Novo cliente', subtitle: 'Cadastro para área do cliente' }
  }
  if (pathname === '/admin/compartilhamento') {
    return { title: 'Compartilhamento', subtitle: 'Links e permissões' }
  }
  if (pathname === '/admin/selecao') {
    return { title: 'Seleção de fotos', subtitle: 'Fluxo do cliente (preview)' }
  }
  if (pathname === '/admin/ferramentas') {
    return { title: 'Ferramentas', subtitle: 'Cadastro e integrações reais' }
  }
  return { title: 'Admin' }
}

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { title, subtitle } = useMemo(() => matchRoute(pathname), [pathname])

  return (
    <AdminShell title={title} subtitle={subtitle}>
      {children}
    </AdminShell>
  )
}
