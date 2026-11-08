import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostList from '../../../PostList';
import { getAllPosts } from '@/lib/posts';
import { CORRIDORS, ctaHref } from '@/lib/corridors';
import { SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';
import { UI } from '@/lib/i18n';
import type { Lang } from '@/lib/posts';

// G-34: one cluster page per P0 corridor, linking its guides and the corridor Risk Report.
export const dynamicParams = false;
// Only corridors that already have guides get a page: an empty cluster is a thin page.
export function generateStaticParams() {
  const used = new Set(getAllPosts().map((p) => p.corridor));
  return CORRIDORS.filter((c) => used.has(c.id)).map((c) => ({ corridor: c.slug }));
}
type Props = { params: Promise<{ corridor: string }> };
const LANGS: Lang[] = ['en', 'it', 'fr'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { corridor } = await params;
  const c = CORRIDORS.find((x) => x.slug === corridor);
  if (!c) return {};
  return { title: UI.en.corridorTitle.replace('{corridor}', c.label.en), description: c.intro.en,
    alternates: { canonical: `/blog/corridor/${c.slug}/` } };
}

export default async function CorridorPage({ params }: Props) {
  const { corridor } = await params;
  const c = CORRIDORS.find((x) => x.slug === corridor);
  if (!c) return notFound();
  const posts = getAllPosts().filter((p) => p.corridor === c.id);
  const path = `/blog/corridor/${c.slug}/`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', url: `${SITE_URL}${path}`, name: c.label.en, description: c.intro.en,
      hasPart: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}/`, inLanguage: p.lang })) },
    breadcrumbLd([[c.label.en, path]]),
  ];
  return (
    <article className="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>{c.label.en}</span></nav>
      <h1>{UI.en.corridorTitle.replace('{corridor}', c.label.en)}</h1>
      {LANGS.map((l) => (
        <section key={l} lang={l}>
          <p className="lead">{c.intro[l]}</p>
          <p><a className="cta" href={ctaHref(l, `corridor-${c.slug}`, c.id)} data-cta="blog-corridor" data-corridor={c.id}>
            {UI[l].corridorCta.replace('{corridor}', c.label[l])}</a></p>
        </section>
      ))}
      {posts.length ? <PostList posts={posts} /> : null}
    </article>
  );
}
