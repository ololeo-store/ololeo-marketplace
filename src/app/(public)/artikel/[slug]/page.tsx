import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { CMS_SECTION_LABEL, type CmsSection } from "@/lib/cms-sections";

// Post baru bisa dipublish kapan aja dari admin — render on-demand, jangan
// di-cache statis biar gak ada delay sampai next deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await api.getCmsPostBySlug(slug);
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || undefined,
        images: post.featuredImage ? [post.featuredImage] : undefined,
      },
    };
  } catch {
    return {};
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await api.getCmsPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <main className="min-h-screen pt-6 pb-24 bg-gradient-to-b from-pink-50/30 dark:from-background to-white dark:to-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-3xl">
        <Link
          href="/artikel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-muted-foreground hover:text-pink-500 dark:hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Kembali ke Artikel
        </Link>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-primary/10 text-pink-500 dark:text-primary mb-4">
          {CMS_SECTION_LABEL[post.category.section as CmsSection]} · {post.category.name}
        </span>

        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-foreground mb-3">
          {post.title}
        </h1>

        <p className="text-sm text-gray-400 dark:text-muted-foreground mb-6">
          Dipublikasikan {formatDate(post.publishedAt)}
        </p>

        <div className="relative aspect-[1200/630] rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-muted">
          <Image
            src={post.featuredImage || "/photo.webp"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <article
          className="max-w-none text-gray-700 dark:text-foreground leading-relaxed space-y-4 [&_a]:text-pink-500 dark:[&_a]:text-primary [&_a]:underline [&_b]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-border">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/artikel?tag=${tag.slug}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-pink-50 dark:hover:bg-primary/10 hover:text-pink-500 dark:hover:text-primary transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
