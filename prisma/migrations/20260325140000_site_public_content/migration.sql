-- CreateTable
CREATE TABLE "SitePublicContent" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroPosterUrl" TEXT NOT NULL,
    "heroVideoUrl" TEXT NOT NULL,
    "portfolioTitle" TEXT NOT NULL,
    "portfolioSubtitle" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePublicContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioShowcaseItem" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioShowcaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioShowcaseItem_sortOrder_idx" ON "PortfolioShowcaseItem"("sortOrder");
