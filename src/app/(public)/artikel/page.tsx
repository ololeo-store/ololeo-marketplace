import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import {
  CMS_SECTION_LABEL,
  CMS_SECTION_SLUG,
  SLUG_TO_CMS_SECTION,
  type CmsSection,
} from "@/lib/cms-sections";

export const metadata: Metadata = {
  title: "Artikel & Promo — Ololeo Store",
  description: "Tips, cerita pelanggan, promo, dan info seputar Ololeo Store.",
};

// Route ini baca query string (?section, ?tag) dan hit backend tiap request
// (bukan ISR) — konten artikel berubah kapan aja admin publish, jadi gak
// perlu di-cache statis.
export const dynamic = "force-dynamic";

const SECTIONS: CmsSection[] = ["BLOG", "PROMO", "HELP_CENTER", "GENERAL"];

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const activeSection = params.section ? SLUG_TO_CMS_SECTION[params.section] : undefined;
  const activeTagSlug = params.tag;

  // Query CMS posts butuh tagId (bukan slug), jadi resolve slug -> id dulu
  // kalau ada filter tag aktif.
  let tagId: string | undefined;
  if (activeTagSlug) {
    try {
      const tags = await api.getCmsTags();
      tagId = tags.find((t) => t.slug === activeTagSlug)?.id;
    } catch {
      tagId = undefined;
    }
  }

  let posts: Awaited<ReturnType<typeof api.getCmsPosts>>["data"] = [];
  try {
    const res = await api.getCmsPosts({
      limit: 24,
      section: activeSection,
      tagId,
    });
    posts = res.data;
  } catch {
    posts = [];
  }

  return (
    <main className="min-h-screen pt-6 pb-24 bg-gradient-to-b from-pink-50/30 dark:from-background to-white dark:to-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4">
            Artikel &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary">
              Promo
            </span>
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Tips, cerita pelanggan, promo, dan info seputar Ololeo Store
          </p>
        </div>

        <div className="bg-white dark:bg-card rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-border shadow-sm shadow-pink-100/10">
          <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
            <Link
              href="/artikel"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !activeSection
                  ? "bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary text-white shadow-md shadow-pink-200/50"
                  : "bg-white dark:bg-card text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border hover:border-pink-200 dark:hover:border-primary/25"
              }`}
            >
              Semua
            </Link>
            {SECTIONS.map((section) => (
              <Link
                key={section}
                href={`/artikel?section=${CMS_SECTION_SLUG[section]}`}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeSection === section
                    ? "bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary text-white shadow-md shadow-pink-200/50"
                    : "bg-white dark:bg-card text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border hover:border-pink-200 dark:hover:border-primary/25"
                }`}
              >
                {CMS_SECTION_LABEL[section]}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-muted-foreground py-16">
              Belum ada artikel di kategori ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/artikel/${post.slug}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-border bg-white dark:bg-card hover:shadow-lg hover:shadow-pink-100/30 transition-all"
                >
                  <div className="relative aspect-[1200/630] overflow-hidden bg-gray-100 dark:bg-muted">
                    <Image
                      src={post.featuredImage || "/photo.webp"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-card/90 text-pink-500 dark:text-primary backdrop-blur">
                      {CMS_SECTION_LABEL[post.category.section as CmsSection]}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 dark:text-muted-foreground mb-1.5">
                      {formatDate(post.publishedAt)} · {post.category.name}
                    </p>
                    <h2 className="font-bold text-gray-900 dark:text-foreground mb-2 line-clamp-2 group-hover:text-pink-500 dark:group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
