import { api } from "./api";
import type { SitemapUrlEntry } from "./sitemap";

export interface SitemapDataset {
  entries: SitemapUrlEntry[];
  /** Terbaru dari seluruh item — dipakai sebagai <lastmod> di sitemap index. */
  lastUpdated: string;
}

function latest(dates: string[]): string {
  if (dates.length === 0) return new Date().toISOString();
  return dates.reduce((max, d) => (d > max ? d : max));
}

// Semua fetcher di bawah ini sengaja gak melempar error kalau API down —
// sitemap yang gagal fetch lebih baik balik kosong (masih valid XML)
// daripada bikin seluruh /sitemap.xml ikut 500.

export async function fetchProductSitemap(): Promise<SitemapDataset> {
  try {
    const res = await api.getProducts({ limit: 1000 });
    const entries = res.data.map((p) => ({
      loc: `/product/${p.id}`,
      lastmod: p.updatedAt,
      changefreq: "weekly" as const,
      priority: 0.8,
    }));
    return { entries, lastUpdated: latest(res.data.map((p) => p.updatedAt)) };
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

export async function fetchCategorySitemap(): Promise<SitemapDataset> {
  try {
    const categories = await api.getCategories();
    const entries = categories.map((c) => ({
      loc: `/shop?category=${c.slug}`,
      lastmod: c.updatedAt,
      changefreq: "weekly" as const,
      priority: 0.7,
    }));
    return { entries, lastUpdated: latest(categories.map((c) => c.updatedAt)) };
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

export async function fetchPostSitemap(): Promise<SitemapDataset> {
  try {
    const res = await api.getCmsPosts({ limit: 1000 });
    const entries = res.data.map((post) => ({
      loc: `/artikel/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: "weekly" as const,
      priority: 0.7,
    }));
    return { entries, lastUpdated: latest(res.data.map((post) => post.updatedAt)) };
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

export async function fetchPostTagSitemap(): Promise<SitemapDataset> {
  try {
    const tags = await api.getCmsTags();
    const entries = tags.map((tag) => ({
      loc: `/artikel?tag=${tag.slug}`,
      lastmod: tag.updatedAt,
      changefreq: "weekly" as const,
      priority: 0.5,
    }));
    return { entries, lastUpdated: latest(tags.map((t) => t.updatedAt)) };
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

// Halaman statis — bukan data API, gak butuh fetch. lastUpdated fixed per
// deploy (build time), bukan per-request, karena kontennya emang gak berubah
// sampai ada perubahan kode.
export function getPageSitemap(): SitemapDataset {
  const buildTime = new Date().toISOString();
  return {
    entries: [
      { loc: "/", lastmod: buildTime, changefreq: "daily", priority: 1 },
      { loc: "/shop", lastmod: buildTime, changefreq: "daily", priority: 0.9 },
      { loc: "/about", lastmod: buildTime, changefreq: "monthly", priority: 0.6 },
      { loc: "/artikel", lastmod: buildTime, changefreq: "daily", priority: 0.8 },
    ],
    lastUpdated: buildTime,
  };
}
