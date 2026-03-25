// Configuração do WhatsApp
export const WHATSAPP_NUMBER = '5511999999999' // Substitua pelo número real

// Mensagens pré-definidas
export const WHATSAPP_MESSAGES = {
  ORCAMENTO: 'Olá! Vim pelo site e gostaria de solicitar um orçamento para um ensaio fotográfico. Podem me ajudar?',
  AGENDAR: 'Olá! Vim pelo site e gostaria de agendar um ensaio fotográfico. Podem me ajudar?',
  FALAR: 'Olá! Vim pelo site e gostaria de falar sobre um ensaio fotográfico. Podem me ajudar?',
  CONTATO: 'Olá! Vim pelo site e gostaria de entrar em contato. Podem me ajudar?'
}

// Função para gerar URL do WhatsApp
export const getWhatsAppUrl = (message: string) => {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}
