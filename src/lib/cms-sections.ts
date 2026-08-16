export type CmsSection = "GENERAL" | "BLOG" | "PROMO" | "HELP_CENTER";

export const CMS_SECTION_LABEL: Record<CmsSection, string> = {
  GENERAL: "Info",
  BLOG: "Blog",
  PROMO: "Promo",
  HELP_CENTER: "Bantuan",
};

export const CMS_SECTION_SLUG: Record<CmsSection, string> = {
  GENERAL: "info",
  BLOG: "blog",
  PROMO: "promo",
  HELP_CENTER: "bantuan",
};

export const SLUG_TO_CMS_SECTION: Record<string, CmsSection> = Object.fromEntries(
  Object.entries(CMS_SECTION_SLUG).map(([section, slug]) => [slug, section as CmsSection]),
) as Record<string, CmsSection>;
