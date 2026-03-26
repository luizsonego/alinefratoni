-- Migração idempotente para produção: conteúdo público do site e portfólio.
-- Compatível com bancos que já tenham parte das tabelas/colunas criadas.

-- 1) Singleton de conteúdo público do site
CREATE TABLE IF NOT EXISTS "SitePublicContent" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroPosterUrl" TEXT NOT NULL,
    "heroVideoUrl" TEXT NOT NULL,
    "portfolioTitle" TEXT NOT NULL,
    "portfolioSubtitle" TEXT NOT NULL,
    "portfolioPageHeroTitle" TEXT NOT NULL DEFAULT '',
    "portfolioPageHeroSubtitle" TEXT NOT NULL DEFAULT '',
    "portfolioPageHeroBgUrl" TEXT NOT NULL DEFAULT '',
    "portfolioPageHeroChipsJson" JSONB,
    "testimonialsTitle" TEXT NOT NULL DEFAULT '',
    "testimonialsSubtitle" TEXT NOT NULL DEFAULT '',
    "testimonialsJson" JSONB,
    "contactHeading" TEXT NOT NULL DEFAULT '',
    "contactBgImageUrl" TEXT NOT NULL DEFAULT '',
    "contactShootTypesJson" JSONB,
    "aboutTitle" TEXT NOT NULL DEFAULT '',
    "aboutImageUrl" TEXT NOT NULL DEFAULT '',
    "aboutParagraphsJson" JSONB,
    "socialInstagram" TEXT NOT NULL DEFAULT '',
    "socialFacebook" TEXT NOT NULL DEFAULT '',
    "socialYoutube" TEXT NOT NULL DEFAULT '',
    "footerTagline" TEXT NOT NULL DEFAULT '',
    "footerAddressLine" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SitePublicContent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "portfolioPageHeroTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "portfolioPageHeroSubtitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "portfolioPageHeroBgUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "portfolioPageHeroChipsJson" JSONB;
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "testimonialsTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "testimonialsSubtitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "testimonialsJson" JSONB;
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "contactHeading" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "contactBgImageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "contactShootTypesJson" JSONB;
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "aboutTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "aboutImageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "aboutParagraphsJson" JSONB;
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "socialInstagram" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "socialFacebook" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "socialYoutube" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "footerTagline" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SitePublicContent" ADD COLUMN IF NOT EXISTS "footerAddressLine" TEXT NOT NULL DEFAULT '';

-- Garante o registro singleton (id = default).
INSERT INTO "SitePublicContent" (
    "id",
    "heroTitle",
    "heroSubtitle",
    "heroPosterUrl",
    "heroVideoUrl",
    "portfolioTitle",
    "portfolioSubtitle",
    "updatedAt"
)
SELECT
    'default',
    '',
    '',
    '',
    '',
    '',
    '',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "SitePublicContent" WHERE "id" = 'default'
);

-- 2) Categorias do portfólio
CREATE TABLE IF NOT EXISTS "PortfolioCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PortfolioCategory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PortfolioCategory" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "PortfolioCategory" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioCategory_slug_key" ON "PortfolioCategory"("slug");
CREATE INDEX IF NOT EXISTS "PortfolioCategory_sortOrder_idx" ON "PortfolioCategory"("sortOrder");

-- 3) Itens do portfólio (home + galeria)
CREATE TABLE IF NOT EXISTS "PortfolioShowcaseItem" (
    "id" TEXT NOT NULL,
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "homeSortOrder" INTEGER NOT NULL DEFAULT 0,
    "gallerySortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "caption" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortfolioShowcaseItem_pkey" PRIMARY KEY ("id")
);

-- Compatibilidade com versões anteriores:
ALTER TABLE "PortfolioShowcaseItem" ADD COLUMN IF NOT EXISTS "showOnHome" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PortfolioShowcaseItem" ADD COLUMN IF NOT EXISTS "homeSortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PortfolioShowcaseItem" ADD COLUMN IF NOT EXISTS "gallerySortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PortfolioShowcaseItem" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "PortfolioShowcaseItem" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Se a coluna antiga "sortOrder" existir, reaproveita os valores.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'PortfolioShowcaseItem'
          AND column_name = 'sortOrder'
    ) THEN
        EXECUTE 'UPDATE "PortfolioShowcaseItem" SET "gallerySortOrder" = COALESCE("gallerySortOrder", "sortOrder")';
        EXECUTE 'UPDATE "PortfolioShowcaseItem" SET "homeSortOrder" = COALESCE("homeSortOrder", "sortOrder")';
    END IF;
END $$;

-- Índices atuais esperados pelo schema Prisma.
CREATE INDEX IF NOT EXISTS "PortfolioShowcaseItem_gallerySortOrder_idx" ON "PortfolioShowcaseItem"("gallerySortOrder");
CREATE INDEX IF NOT EXISTS "PortfolioShowcaseItem_showOnHome_homeSortOrder_idx" ON "PortfolioShowcaseItem"("showOnHome", "homeSortOrder");

-- Remove índice legado caso exista.
DROP INDEX IF EXISTS "PortfolioShowcaseItem_sortOrder_idx";

-- FK de categoria com proteção idempotente.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PortfolioShowcaseItem_categoryId_fkey'
    ) THEN
        ALTER TABLE "PortfolioShowcaseItem"
        ADD CONSTRAINT "PortfolioShowcaseItem_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES "PortfolioCategory"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END $$;
