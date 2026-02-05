import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { weddings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

// SEO-страницы под типы мероприятий
const EVENT_TYPE_PAGES = [
  { slug: 'wedding', title: 'Онлайн-приглашения на свадьбу' },
  { slug: 'birthday', title: 'Онлайн-приглашения на день рождения' },
  { slug: 'corporate', title: 'Онлайн-приглашения на корпоратив' },
  { slug: 'anniversary', title: 'Онлайн-приглашения на юбилей' },
  { slug: 'sundettoi', title: 'Онлайн-приглашения на сүндет той' },
  { slug: 'tusaukeser', title: 'Онлайн-приглашения на тұсау кесер' },
  { slug: 'kyz-uzatu', title: 'Онлайн-приглашения на қыз ұзату' },
];

// Демо-примеры приглашений
const DEMO_PAGES = [
  { slug: 'malikaaskar', title: 'Малика & Аскар - Свадьба (AI)' },
  { slug: 'ai-1768103015847', title: 'Юбилей 50 лет (AI)' },
  { slug: 'tusau-keser-alihan', title: 'Тұсау кесер Әліхан (AI)' },
  { slug: 'madinawed', title: 'Мадина - Свадьба (AI)' },
  { slug: 'diasbday', title: 'День рождения Диаса (AI)' },
  { slug: 'demo-aigerim-nurlan', title: 'Айгерім & Нұрлан - Свадьба' },
  { slug: 'demo-anna-dmitry', title: 'Анна & Дмитрий - Свадьба' },
];

export const sitemapRouter = router({
  generate: publicProcedure.query(async () => {
    const baseUrl = process.env.BASE_URL || "https://invites.kz";
    const today = new Date().toISOString().split("T")[0];
    const urls: SitemapUrl[] = [];

    // === Главная страница ===
    urls.push({
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: "weekly",
      priority: 1.0,
    });

    // === SEO-страницы типов мероприятий ===
    for (const eventType of EVENT_TYPE_PAGES) {
      urls.push({
        loc: `${baseUrl}/online-invitation/${eventType.slug}`,
        lastmod: today,
        changefreq: "weekly",
        priority: 0.9,
      });
    }

    // === Демо-примеры приглашений ===
    for (const demo of DEMO_PAGES) {
      urls.push({
        loc: `${baseUrl}/${demo.slug}`,
        lastmod: today,
        changefreq: "monthly",
        priority: 0.85,
      });
    }

    // === Страница функционала ===
    urls.push({
      loc: `${baseUrl}/features`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8,
    });

    // === Блог ===
    urls.push({
      loc: `${baseUrl}/blog`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    });

    // === Публичные ОПУБЛИКОВАННЫЕ приглашения ===
    try {
      const db = await getDb();
      if (db) {
        // Только опубликованные приглашения (isPaid = true)
        const publicWeddings = await db
          .select({
            slug: weddings.slug,
            updatedAt: weddings.updatedAt,
            isPaid: weddings.isPaid,
          })
          .from(weddings)
          .where(eq(weddings.isPaid, true));

        for (const wedding of publicWeddings) {
          urls.push({
            loc: `${baseUrl}/${wedding.slug}`,
            lastmod: wedding.updatedAt.toISOString().split("T")[0],
            changefreq: "monthly",
            priority: 0.6,
          });
        }
      }
    } catch (error) {
      console.warn("[Sitemap] Failed to fetch weddings:", error);
    }

    // === Юридические страницы ===
    urls.push({
      loc: `${baseUrl}/terms`,
      lastmod: today,
      changefreq: "yearly",
      priority: 0.3,
    });

    urls.push({
      loc: `${baseUrl}/privacy`,
      lastmod: today,
      changefreq: "yearly",
      priority: 0.3,
    });

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return { xml };
  }),
});
