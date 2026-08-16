import { SITE_URL } from "./site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/** Sitemap standar (urlset) — satu file berisi daftar <url>, dikonsumsi search engine. */
export function buildUrlset(entries: SitemapUrlEntry[]): string {
  const urls = entries
    .map((entry) => {
      const loc = `<loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`;
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
      const priority = entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "";
      return `<url>${loc}${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap-urlset.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod: string;
  /** Non-standar (di luar spec sitemaps.org) — dipakai XSL stylesheet buat kolom
   * "URL Count" di tampilan index. Search engine crawler abaikan elemen ini. */
  urlCount: number;
}

/** Sitemap index — daftar sitemap lain (page/category/product/tag/section/cms),
 * dirender pakai XSL stylesheet supaya tampil sebagai tabel di browser, mirip WordPress/Yoast. */
export function buildSitemapIndex(entries: SitemapIndexEntry[]): string {
  const sitemaps = entries
    .map(
      (entry) =>
        `<sitemap><loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc><lastmod>${entry.lastmod}</lastmod><url-count>${entry.urlCount}</url-count></sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap-index.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`;
}

export const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
};
