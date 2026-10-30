import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPost, getRelated, getTranslations, hreflang, tagSlug } from '@/lib/posts';
import { getAuthor } from '@/lib/authors';
import { ABOUT_PATH, ORG_ID, SITE_URL, WEBSITE_ID, breadcrumbLd, jsonLd } from '@/lib/site';
import { imageSize } from '@/lib/images';
import { UI } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return getAllPosts().map((p) => ({ slug: p.slug })); }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.description,
    alternates: { canonical: `/blog/${p.slug}/`, languages: hreflang(p, SITE_URL) },
    openGraph: { type: 'article', title: p.title, description: p.description, url: `/blog/${p.slug}/`,
      publishedTime: p.date, modifiedTime: p.updated || p.date, locale: p.lang === 'it' ? 'it_IT' : 'en_US',
      images: p.image ? [{ url: p.image, alt: p.imageAlt || p.title }] : undefined },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: p.image ? [p.image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const t = UI[p.lang];
  const url = `${SITE_URL}/blog/${p.slug}/`;
  const author = getAuthor(p.author);
  const authorLd = author.type === 'Person'
    ? { '@type': 'Person', name: author.name, url: `${SITE_URL}${ABOUT_PATH}`, worksFor: { '@id': ORG_ID } }
    : { '@type': 'Organization', name: author.name, url: `${SITE_URL}${ABOUT_PATH}`, parentOrganization: { '@id': ORG_ID } };
  const ld: object[] = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, inLanguage: p.lang, mainEntityOfPage: url,
    image: p.image ? `${SITE_URL}${p.image}` : undefined, keywords: p.tags?.join(', ') || undefined,
    author: authorLd, publisher: { '@id': ORG_ID }, isPartOf: { '@id': WEBSITE_ID },
  }, breadcrumbLd([[p.title, `/blog/${p.slug}/`]])];
  if (p.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const others = getTranslations(p).filter((o) => o.slug !== p.slug);
  const related = getRelated(p);
  const cover = p.image ? imageSize(p.image) : null;
  return (
    <article lang={p.lang} className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>{p.title}</span></nav>
      <h1>{p.title}</h1>
      <p className="byline">
        {t.by} <a href={ABOUT_PATH}>{author.name}</a> · <time dateTime={p.date}>{p.date}</time>
        {p.updated && p.updated !== p.date && <> · {t.updated} <time dateTime={p.updated}>{p.updated}</time></>}
        {others.map((o) => <span key={o.slug}> · {t.alsoIn} <a href={`/blog/${o.slug}/`} hrefLang={o.lang} lang={o.lang}>{UI[o.lang].language}</a></span>)}
      </p>
      {p.image && <img className="cover" src={p.image} alt={p.imageAlt || p.title} width={cover?.width} height={cover?.height} fetchPriority="high" />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      {!!p.tags?.length && (
        <p className="tags">{t.topics}: {p.tags.map((tag, i) => <span key={tag}>{i > 0 && ', '}<a href={`/blog/tag/${tagSlug(tag)}/`}>{tag}</a></span>)}</p>
      )}
      {!!related.length && (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title">{t.related}</h2>
          <ul>{related.map((r) => <li key={r.slug} lang={r.lang}><a href={`/blog/${r.slug}/`}>{r.title}</a></li>)}</ul>
        </section>
      )}
      <aside className="cta-box">
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaBody}</p>
        <a href="https://relomatrix.com">{t.ctaLink}</a>
      </aside>
    </article>
  );
}
