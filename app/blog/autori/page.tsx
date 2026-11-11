import type { Metadata } from 'next';
import { AUTHORS } from '@/lib/authors';
import { AUTHOR_PATH, breadcrumbLd, jsonLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Autori / Authors',
  description: 'Chi scrive gli articoli del blog di Relomatrix. Who writes the Relomatrix Blog articles.',
  alternates: { canonical: '/blog/autori/' },
};

export default function Authors() {
  return (
    <article className="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([['Autori', '/blog/autori/']])) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Autori</span></nav>
      <h1>Autori <span lang="en">/ Authors</span></h1>
      <ul>
        {Object.values(AUTHORS).map((a) => (
          <li key={a.key}><a href={AUTHOR_PATH(a.key)}>{a.name}</a>, {a.role.it} <span lang="en">· {a.role.en}</span></li>
        ))}
      </ul>
    </article>
  );
}
