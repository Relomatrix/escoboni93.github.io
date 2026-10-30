import type { Metadata } from 'next';
import { getAllTags } from '@/lib/posts';
import { breadcrumbLd, jsonLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Topics / Argomenti',
  description: 'All topics covered by the Relomatrix Blog: relocation, immigration, tax and cross-border compliance.',
  alternates: { canonical: '/blog/tag/' },
};

export default function TagIndex() {
  const tags = getAllTags();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([['Topics', '/blog/tag/']])) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Topics</span></nav>
      <h1>Topics <span lang="it">/ Argomenti</span></h1>
      <ul className="tag-index">
        {tags.map((t) => <li key={t.slug}><a href={`/blog/tag/${t.slug}/`}>{t.label}</a> ({t.posts.length})</li>)}
      </ul>
    </>
  );
}
