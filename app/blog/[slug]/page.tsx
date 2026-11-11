import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPost, getRelated, getTranslations, hreflang, tagSlug } from '@/lib/posts';
import { bylineName, bylineRole, getAuthor, getReviewer } from '@/lib/authors';
import { ctaHref, getCorridor } from '@/lib/corridors';
import { AUTHOR_PATH, ORG_ID, SITE_URL, WEBSITE_ID, breadcrumbLd, jsonLd } from '@/lib/site';
import { imageSize } from '@/lib/images';
import { OG_LOCALE, UI, formatDate } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return getAllPosts().map((p) => ({ slug: p.slug })); }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    // The layout appends " | Relomatrix" (13 chars). Long titles keep only the article title so search
    // results do not cut it off (Google shows about 60 characters).
    title: p.title.length + 13 > 60 ? { absolute: p.title } : p.title, description: p.description,
    alternates: { canonical: `/blog/${p.slug}/`, languages: hreflang(p, SITE_URL) },
    openGraph: { type: 'article', title: p.title, description: p.description, url: `/blog/${p.slug}/`,
      publishedTime: p.date, modifiedTime: p.updated || p.date, locale: OG_LOCALE[p.lang],
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
    ? { '@type': 'Person', '@id': `${SITE_URL}${AUTHOR_PATH(author.key)}#person`, name: author.name, jobTitle: author.jobTitle,
        url: `${SITE_URL}${AUTHOR_PATH(author.key)}`, worksFor: { '@id': ORG_ID } }
    : { '@type': 'Organization', name: author.name, url: `${SITE_URL}${AUTHOR_PATH(author.key)}`, parentOrganization: { '@id': ORG_ID } };
  const reviewer = getReviewer(p.reviewedBy);
  const corridor = getCorridor(p.corridor);
  const fill = (s: string) => s.replace('{corridor}', corridor ? corridor.label[p.lang] : '');
  const ld: object[] = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, inLanguage: p.lang, mainEntityOfPage: url,
    image: p.image ? `${SITE_URL}${p.image}` : undefined, keywords: p.tags?.join(', ') || undefined,
    author: authorLd, publisher: { '@id': ORG_ID }, isPartOf: { '@id': WEBSITE_ID },
    ...(reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer.name, url: reviewer.url }, lastReviewed: p.reviewedAt } : {}),
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
        {t.by} <a href={AUTHOR_PATH(author.key)} rel="author">{bylineName(author, p.lang)}</a>{bylineRole(author, p.lang) ? <>, {bylineRole(author, p.lang)}</> : null} · <time dateTime={p.date}>{formatDate(p.date, p.lang)}</time>
        {p.updated && p.updated !== p.date && <> · {t.updated} <time dateTime={p.updated}>{formatDate(p.updated, p.lang)}</time></>}
        {reviewer && <> · {t.reviewedBy} {reviewer.url ? <a href={reviewer.url}>{reviewer.name}</a> : reviewer.name}, {reviewer.qualification[p.lang]} (<time dateTime={p.reviewedAt}>{formatDate(String(p.reviewedAt), p.lang)}</time>)</>}
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
        <a href={ctaHref(p.lang, p.slug, p.corridor)} data-cta="blog-post" data-corridor={corridor?.id}>
          {corridor ? fill(t.ctaCorridorLink) : t.ctaLink}
        </a>
        {corridor && <p className="cta-cluster"><a href={`/blog/corridor/${corridor.slug}/`}>{fill(t.corridorCluster)}</a></p>}
      </aside>
    </article>
  );
}
