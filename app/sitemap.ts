export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { getAllPosts, getAllTags, hreflang } from '@/lib/posts';
import { ABOUT_PATH, SITE_URL } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [{ url: `${SITE_URL}/blog/`, lastModified: posts[0]?.updated || posts[0]?.date, changeFrequency: 'daily' },
    ...posts.map((p) => {
      const languages = hreflang(p, SITE_URL);
      return { url: `${SITE_URL}/blog/${p.slug}/`, lastModified: p.updated || p.date, changeFrequency: 'weekly' as const,
        ...(languages ? { alternates: { languages } } : {}) };
    }),
    ...getAllTags().filter((t) => t.posts.length >= 2).map((t) => ({ url: `${SITE_URL}/blog/tag/${t.slug}/`, changeFrequency: 'weekly' as const })),
    { url: `${SITE_URL}${ABOUT_PATH}`, changeFrequency: 'monthly' }];
}
