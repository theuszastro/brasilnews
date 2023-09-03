-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "portalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NewsContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT,
    "articleQuoteId" TEXT,
    CONSTRAINT "NewsContent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsContent_articleQuoteId_fkey" FOREIGN KEY ("articleQuoteId") REFERENCES "NewsArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "image" TEXT,
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "newsId" TEXT,
    CONSTRAINT "NewsArticle_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsContentPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "isBold" BOOLEAN NOT NULL,
    "isHighlight" BOOLEAN NOT NULL,
    "isLink" BOOLEAN NOT NULL,
    "href" TEXT,
    "contentId" TEXT,
    "listId" TEXT,
    "quoteId" TEXT,
    CONSTRAINT "NewsContentPart_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "NewsContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsContentPart_listId_fkey" FOREIGN KEY ("listId") REFERENCES "NewsList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsContentPart_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "NewsContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT,
    CONSTRAINT "NewsList_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mining" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "portal" TEXT NOT NULL
);
