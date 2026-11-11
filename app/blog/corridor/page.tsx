import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/posts';
import { CORRIDORS } from '@/lib/corridors';
import { breadcrumbLd, jsonLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Guide per corridoio / Guides by corridor',
  description: 'Guide del blog di Relomatrix raccolte per corridoio di trasferimento. Relomatrix Blog guides grouped by relocation corridor.',
  alternates: { canonical: '/blog/corridor/' },
};

export default function Corridors() {
  const used = new Set(getAllPosts().map((p) => p.corridor));
  return (
    <article className="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([['Corridoi', '/blog/corridor/']])) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Corridoi</span></nav>
      <h1>Guide per corridoio <span lang="en">/ Guides by corridor</span></h1>
      <ul>
        {CORRIDORS.filter((c) => used.has(c.id)).map((c) => (
          <li key={c.id}><a href={`/blog/corridor/${c.slug}/`}>{c.label.it}</a> <span lang="en">· {c.label.en}</span> <span lang="fr">· {c.label.fr}</span></li>
        ))}
      </ul>
    </article>
  );
}
