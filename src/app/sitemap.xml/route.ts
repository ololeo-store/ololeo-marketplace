import {
  getPageSitemap,
  fetchCategorySitemap,
  fetchProductSitemap,
  fetchPostSitemap,
  fetchPostTagSitemap,
} from "@/lib/sitemap-data";
import { buildSitemapIndex, XML_HEADERS } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Index yang nunjuk ke sitemap per tipe konten. Count & lastmod tiap baris
// dihitung dari data asli (kecuali page, yang statis) — bukan angka statis,
// jadi selalu sinkron sama isi sitemap masing2.
export async function GET() {
  const [page, category, product, post, postTag] = await Promise.all([
    Promise.resolve(getPageSitemap()),
    fetchCategorySitemap(),
    fetchProductSitemap(),
    fetchPostSitemap(),
    fetchPostTagSitemap(),
  ]);

  const xml = buildSitemapIndex([
    { loc: "/page-sitemap.xml", lastmod: page.lastUpdated, urlCount: page.entries.length },
    { loc: "/post-sitemap.xml", lastmod: post.lastUpdated, urlCount: post.entries.length },
    { loc: "/posttag-sitemap.xml", lastmod: postTag.lastUpdated, urlCount: postTag.entries.length },
    { loc: "/product-sitemap.xml", lastmod: product.lastUpdated, urlCount: product.entries.length },
    { loc: "/category-sitemap.xml", lastmod: category.lastUpdated, urlCount: category.entries.length },
  ]);

  return new Response(xml, { headers: XML_HEADERS });
}
