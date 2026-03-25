export const shareExpirationPresetLabels = {
  NEVER: 'Sem expiração',
  DAYS_7: '7 dias',
  DAYS_30: '30 dias',
  DAYS_90: '90 dias',
} as const

export type ShareExpirationPresetLabelKey = keyof typeof shareExpirationPresetLabels

export const shareLinkScopeLabels = {
  EVENT: 'Projeto (cliente)',
  FOLDER: 'Pasta',
} as const

export type ShareLinkScopeLabelKey = keyof typeof shareLinkScopeLabels
