import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostList from '../../../PostList';
import { getAllTags } from '@/lib/posts';
import { SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';

export const dynamicParams = false;
// Static export needs at least one param; a placeholder keeps the build green before any post has tags.
export function generateStaticParams() {
  const tags = getAllTags();
  return tags.length ? tags.map((t) => ({ tag: t.slug })) : [{ tag: '_' }];
}

type Props = { params: Promise<{ tag: string }> };
const find = async (params: Props['params']) => { const s = (await params).tag; return getAllTags().find((t) => t.slug === s); };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await find(params);
  if (!t) return { robots: { index: false } };
  const langs = new Set(t.posts.map((p) => p.lang));
  return {
    title: `${t.label}: guides and articles`,
    description: `Relomatrix articles on ${t.label}${langs.size > 1 ? ` (${[...langs].map((l) => ({ en: 'English', it: 'Italian', fr: 'French' })[l]).join(', ')})` : ''}, each with official sources.`,
    alternates: { canonical: `/blog/tag/${t.slug}/` },
    robots: t.posts.length < 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function TagPage({ params }: Props) {
  const t = await find(params);
  if (!t) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([
        breadcrumbLd([['Topics', '/blog/tag/'], [t.label, `/blog/tag/${t.slug}/`]]),
        { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.label, url: `${SITE_URL}/blog/tag/${t.slug}/`,
          hasPart: t.posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}/`, inLanguage: p.lang })) },
      ]) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <a href="/blog/tag/">Topics</a> › <span>{t.label}</span></nav>
      <h1>{t.label}</h1>
      <p className="lead">{t.posts.length} {t.posts.length === 1 ? 'article' : 'articles'}</p>
      <PostList posts={t.posts} />
    </>
  );
}
