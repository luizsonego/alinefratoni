export type EventStatus = 'editing' | 'delivered' | 'completed'

export const eventStatusLabels: Record<EventStatus, string> = {
  editing: 'Em edição',
  delivered: 'Entregue',
  completed: 'Finalizado',
}

export interface MockProject {
  id: string
  name: string
  clientName: string
  clientEmail: string
  date: string
  fileCount: number
  videoCount: number
  photoCount: number
  status: EventStatus
  coverUrl: string
  storageBytes: number
}

export interface MockClient {
  id: string
  name: string
  email: string
  phone: string
  projectIds: string[]
  lastAccess: string
  accessCount: number
}

export interface MockActivity {
  id: string
  title: string
  description: string
  time: string
  kind: 'upload' | 'share' | 'client' | 'project'
}

export type UploadQueueStatus = 'uploading' | 'processing' | 'done'

export interface MockUploadItem {
  id: string
  name: string
  progress: number
  status: UploadQueueStatus
  previewUrl?: string
}

export type MediaKind = 'photo' | 'video'

export interface MockMediaItem {
  id: string
  kind: MediaKind
  url: string
  thumbUrl: string
  favorite: boolean
  clientSelected: boolean
}

export interface MockShareLink {
  id: string
  projectId: string
  projectName: string
  url: string
  isPublic: boolean
  hasPassword: boolean
  expiresAt: string | null
  canDownload: boolean
  canSelect: boolean
  createdAt: string
}

export const mockProjects: MockProject[] = [
  {
    id: 'evt-casamento-rosa',
    name: 'Casamento Marina & Lucas',
    clientName: 'Marina Silva',
    clientEmail: 'marina@email.com',
    date: '2025-03-08',
    fileCount: 842,
    photoCount: 780,
    videoCount: 62,
    status: 'delivered',
    coverUrl: 'https://picsum.photos/seed/cas1/800/600',
    storageBytes: 12_400_000_000,
  },
  {
    id: 'evt-formatura-uf',
    name: 'Formatura Medicina UF',
    clientName: 'Comissão de Formatura',
    clientEmail: 'contato@formatura.com',
    date: '2025-02-22',
    fileCount: 1204,
    photoCount: 1100,
    videoCount: 104,
    status: 'editing',
    coverUrl: 'https://picsum.photos/seed/form1/800/600',
    storageBytes: 18_200_000_000,
  },
  {
    id: 'evt-ensaio-studio',
    name: 'Ensaio editorial — Studio',
    clientName: 'Ana Paula',
    clientEmail: 'ana@email.com',
    date: '2025-01-15',
    fileCount: 156,
    photoCount: 148,
    videoCount: 8,
    status: 'completed',
    coverUrl: 'https://picsum.photos/seed/ens1/800/600',
    storageBytes: 2_100_000_000,
  },
  {
    id: 'evt-corporativo-tech',
    name: 'Evento corporativo Tech Summit',
    clientName: 'Tech Summit Ltda',
    clientEmail: 'eventos@techsummit.io',
    date: '2024-12-10',
    fileCount: 430,
    photoCount: 400,
    videoCount: 30,
    status: 'completed',
    coverUrl: 'https://picsum.photos/seed/corp1/800/600',
    storageBytes: 5_800_000_000,
  },
]

export const mockClients: MockClient[] = [
  {
    id: 'cli-1',
    name: 'Marina Silva',
    email: 'marina@email.com',
    phone: '(11) 99999-0001',
    projectIds: ['evt-casamento-rosa'],
    lastAccess: '2025-03-20T14:32:00',
    accessCount: 24,
  },
  {
    id: 'cli-2',
    name: 'Comissão de Formatura',
    email: 'contato@formatura.com',
    phone: '(21) 98888-2233',
    projectIds: ['evt-formatura-uf'],
    lastAccess: '2025-03-19T09:15:00',
    accessCount: 12,
  },
  {
    id: 'cli-3',
    name: 'Ana Paula',
    email: 'ana@email.com',
    phone: '(31) 97777-4455',
    projectIds: ['evt-ensaio-studio'],
    lastAccess: '2025-03-10T18:00:00',
    accessCount: 8,
  },
  {
    id: 'cli-4',
    name: 'Tech Summit Ltda',
    email: 'eventos@techsummit.io',
    phone: '(11) 4002-8922',
    projectIds: ['evt-corporativo-tech'],
    lastAccess: '2025-02-28T11:20:00',
    accessCount: 41,
  },
]

export const mockActivities: MockActivity[] = [
  {
    id: 'a1',
    title: 'Upload concluído',
    description: '128 arquivos em «Formatura Medicina UF»',
    time: 'Há 2 horas',
    kind: 'upload',
  },
  {
    id: 'a2',
    title: 'Link compartilhado',
    description: 'Cliente acessou a galeria «Casamento Marina & Lucas»',
    time: 'Ontem',
    kind: 'share',
  },
  {
    id: 'a3',
    title: 'Seleção do cliente',
    description: '42 fotos marcadas em «Ensaio editorial — Studio»',
    time: 'Há 3 dias',
    kind: 'client',
  },
  {
    id: 'a4',
    title: 'Novo projeto',
    description: 'Projeto «Evento corporativo Tech Summit» arquivado',
    time: 'Há 1 semana',
    kind: 'project',
  },
]

export const mockRecentUploads: MockUploadItem[] = [
  {
    id: 'u1',
    name: 'DSC_8842.jpg',
    progress: 100,
    status: 'done',
    previewUrl: 'https://picsum.photos/seed/u1/120/120',
  },
  {
    id: 'u2',
    name: 'highlight_reel.mp4',
    progress: 100,
    status: 'done',
    previewUrl: 'https://picsum.photos/seed/u2/120/120',
  },
  {
    id: 'u3',
    name: 'batch_wedding.zip',
    progress: 67,
    status: 'processing',
  },
]

export function getProjectById(id: string): MockProject | undefined {
  return mockProjects.find((p) => p.id === id)
}

export function getMediaForProject(projectId: string): MockMediaItem[] {
  const seed = projectId.replace(/[^a-z0-9]/gi, '')
  return Array.from({ length: 24 }, (_, i) => {
    const n = i + 1
    const isVideo = i % 7 === 0
    const id = `${projectId}-m-${n}`
    return {
      id,
      kind: isVideo ? 'video' : 'photo',
      url: `https://picsum.photos/seed/${seed}${n}/1600/1200`,
      thumbUrl: `https://picsum.photos/seed/${seed}${n}/400/300`,
      favorite: i % 5 === 1,
      clientSelected: i % 9 === 2,
    }
  })
}

export const mockShareLinks: MockShareLink[] = [
  {
    id: 'sh-1',
    projectId: 'evt-casamento-rosa',
    projectName: 'Casamento Marina & Lucas',
    url: 'https://estudio.app/g/abc123',
    isPublic: true,
    hasPassword: false,
    expiresAt: '2025-06-01',
    canDownload: true,
    canSelect: true,
    createdAt: '2025-03-01',
  },
  {
    id: 'sh-2',
    projectId: 'evt-formatura-uf',
    projectName: 'Formatura Medicina UF',
    url: 'https://estudio.app/g/def456',
    isPublic: false,
    hasPassword: true,
    expiresAt: null,
    canDownload: true,
    canSelect: false,
    createdAt: '2025-02-25',
  },
]

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}

export const dashboardTotals = {
  totalProjects: mockProjects.length,
  activeClients: mockClients.length,
  storageUsedBytes: mockProjects.reduce((a, p) => a + p.storageBytes, 0),
  storageQuotaBytes: 100_000_000_000,
}
