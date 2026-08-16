import { fetchCategorySitemap } from "@/lib/sitemap-data";
import { buildUrlset, XML_HEADERS } from "@/lib/sitemap";

// force-dynamic: tanpa ini Next nge-cache hasil fetch pas build & sitemap
// jadi statis (gak update walau data di backend berubah).
export const dynamic = "force-dynamic";

// Kategori produk asli dari /public/product-categories.
export async function GET() {
  const { entries } = await fetchCategorySitemap();
  return new Response(buildUrlset(entries), { headers: XML_HEADERS });
}
