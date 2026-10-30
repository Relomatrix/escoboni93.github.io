import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/blog`, changeFrequency: 'daily' },
    ...getAllPosts().map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated || p.date, changeFrequency: 'weekly' as const }))];
}
