# Aline Fratoni Fotografia

Site profissional para estúdio de fotografia especializado em ensaios femininos, acompanhamentos e datas temáticas.

## 🎨 Design

O site foi desenvolvido seguindo fielmente o design da imagem de referência, utilizando:

- **Paleta de Cores**: Tons terracota/warm como cor principal, com base neutra (off-white, cinza claro)
- **Tipografia**: Playfair Display (serif) para títulos e Inter (sans-serif) para corpo do texto
- **Layout**: Design responsivo com foco na experiência do usuário

## 🚀 Tecnologias

- **Next.js 14** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **Framer Motion** para animações suaves
- **Lucide React** para ícones
- **Prisma + PostgreSQL** para persistência
- **JWT + cookies HTTP-only** para autenticação
- **Google Drive API** (opcional) para listagem de fotos

## 🔐 Área privada (Admin + Cliente)

O projeto agora possui:

- ` /login`: acesso com campo único (usuário/e-mail/telefone) + senha
- ` /admin`: cadastro de cliente, criação de evento (capa por **upload** ou URL externa) e vínculo de pasta do Google Drive
- ` /cliente`: lista de eventos vinculados ao cliente logado
- ` /cliente/evento/[id]`: galeria no estilo **Vercel Image Gallery** (fundo preto, card lateral com watermark, grid tipo masonry, barra superior)

### Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Defina:

- `DATABASE_URL`: string de conexão do PostgreSQL
- `AUTH_SECRET`: segredo para assinatura da sessão
- `GOOGLE_DRIVE_API_KEY`: opcional, para listar miniaturas/imagens diretamente do Drive
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`: integração Cloudflare R2
- `R2_PUBLIC_BASE_URL`: URL pública base para renderizar/baixar imagens do R2 no cliente

### Capas de evento (upload)

- Arquivos ficam em `public/uploads/events/` (pasta versionada com `.gitkeep`; os arquivos não entram no Git).
- Formatos: JPG, PNG, WebP, GIF · máximo **5MB** (limite do Server Action em `next.config.js`).
- No resumo do admin você pode **trocar a capa** de um evento já criado.
- **Deploy:** em ambientes serverless sem disco persistente (ex.: Vercel), uploads no filesystem podem não persistir entre deploys — para produção, considere bucket (S3, R2, etc.) ou servidor com volume persistente.

### Cloudflare R2 (upload estilo drive)

- No painel `/admin`, a etapa `3) Cloudflare R2 (pasta + upload)` permite:
  - selecionar o evento;
  - criar pasta no R2 (prefixo);
  - fazer upload com **arrastar e soltar**;
  - acompanhar fila em **segundo plano** com `%` e **tempo estimado restante (ETA)**.
- As pastas R2 são salvas como referência `r2://...` e aparecem na galeria do cliente junto com pastas do Drive.
- A visualização de mídias do R2 no cliente depende de `R2_PUBLIC_BASE_URL` configurada.

### Setup do banco

```bash
yarn prisma:generate
yarn prisma:push
```

### Criar primeiro admin

```bash
yarn create:admin --name="Administrador" --username="admin" --password="senha123" --email="admin@site.com"
```

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd estudio
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎯 Funcionalidades

### Seções Implementadas

1. **Header Fixo**: Logo, navegação, CTA e ícones sociais
2. **Hero Section**: Imagem de fundo com texto centralizado
3. **Intuição e Confiança**: Apresentação da fotógrafa e grid de categorias
4. **Experiência**: Três colunas destacando o diferencial do estúdio
5. **Depoimentos**: Carrossel de testemunhos de clientes
6. **Contato**: Formulário de orçamento com fundo impactante
7. **Footer**: Links de navegação e informações de copyright

### Animações

- Scroll suave entre seções
- Animações de entrada com Framer Motion
- Efeitos de hover em botões e cards
- Carrossel interativo de depoimentos

### Responsividade

- Design totalmente responsivo
- Otimizado para mobile, tablet e desktop
- Imagens responsivas com Next.js Image

## 🎨 Paleta de Cores

```css
/* Cores principais */
--warm-50: #fefdf8
--warm-100: #fef7e0
--warm-600: #dd6b20
--warm-700: #c05621

/* Cores neutras */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-900: #111827
```

## 📱 Estrutura do Projeto

```
estudio/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── IntroSection.tsx
│   ├── ExperienceSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── ContactSection.tsx
│   └── Footer.tsx
├── public/
└── package.json
```

## 🚀 Deploy

Para fazer deploy do projeto:

1. Build do projeto:
```bash
npm run build
```

2. Execute em produção:
```bash
npm start
```

## 📞 Contato

Para dúvidas sobre o projeto ou customizações, entre em contato através do formulário no site.
