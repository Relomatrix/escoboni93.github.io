import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPost } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() { return getAllPosts().map((p) => ({ slug: p.slug })); }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.description,
    alternates: { canonical: `/blog/${p.slug}/` },
    openGraph: { type: 'article', title: p.title, description: p.description, url: `/blog/${p.slug}/`,
      publishedTime: p.date, modifiedTime: p.updated || p.date, locale: p.lang === 'it' ? 'it_IT' : 'en_US',
      images: p.image ? [{ url: p.image, alt: p.imageAlt || p.title }] : undefined },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: p.image ? [p.image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const url = `${SITE_URL}/blog/${p.slug}/`;
  const ld: object[] = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, inLanguage: p.lang, mainEntityOfPage: url,
    image: p.image ? `${SITE_URL}${p.image}` : undefined,
    author: { '@type': 'Organization', name: p.author || 'Relomatrix', url: 'https://relomatrix.com' },
    publisher: { '@type': 'Organization', name: 'Relomatrix', url: 'https://relomatrix.com', logo: { '@type': 'ImageObject', url: `${SITE_URL}/relomatrix-wordmark-navy-on-ivory.png` } },
  }];
  if (p.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  return (
    <article lang={p.lang} className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <p className="meta"><a href="/blog/">← Blog</a> · <time dateTime={p.date}>{p.date}</time></p>
      <h1>{p.title}</h1>
      {p.image && <img className="cover" src={p.image} alt={p.imageAlt || p.title} />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      <aside className="cta-box">
        <h2>Review cross-border risks before moving</h2>
        <p>Relomatrix turns fragmented relocation and compliance information into source-referenced reviews.</p>
        <a href="https://relomatrix.com">Visit Relomatrix</a>
      </aside>
    </article>
  );
}
