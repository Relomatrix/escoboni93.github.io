import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostList from '../../../PostList';
import { getAllPosts } from '@/lib/posts';
import { AUTHORS, DEFAULT_AUTHOR } from '@/lib/authors';
import { AUTHOR_PATH, ORG_ID, SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';

// G-31: one profile page per byline, with the bio and the author's articles.
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(AUTHORS).map((key) => ({ key })); }
type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = AUTHORS[(await params).key];
  if (!a) return {};
  return { title: a.name, description: a.bio?.en || a.role.en, alternates: { canonical: AUTHOR_PATH(a.key) } };
}

export default async function AuthorPage({ params }: Props) {
  const a = AUTHORS[(await params).key];
  if (!a) return notFound();
  const posts = getAllPosts().filter((p) => (p.author || DEFAULT_AUTHOR) === a.key);
  const url = `${SITE_URL}${AUTHOR_PATH(a.key)}`;
  const ld = [
    a.type === 'Person'
      ? { '@context': 'https://schema.org', '@type': 'ProfilePage', url, mainEntity: { '@type': 'Person', '@id': `${url}#person`,
          name: a.name, jobTitle: a.jobTitle, description: a.bio?.en, worksFor: { '@id': ORG_ID }, sameAs: a.sameAs } }
      : { '@context': 'https://schema.org', '@type': 'Organization', name: a.name, url, parentOrganization: { '@id': ORG_ID } },
    breadcrumbLd([[a.name, AUTHOR_PATH(a.key)]]),
  ];
  return (
    <article className="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>{a.name}</span></nav>
      <h1>{a.name}</h1>
      {a.bio ? (
        <div className="prose">
          <p lang="it">{a.bio.it}</p>
          <p lang="en">{a.bio.en}</p>
          <p lang="fr">{a.bio.fr}</p>
        </div>
      ) : <p>{a.role.it} · {a.role.en} · {a.role.fr}</p>}
      {!!posts.length && <><h2>Articoli · Articles</h2><PostList posts={posts} /></>}
    </article>
  );
}
