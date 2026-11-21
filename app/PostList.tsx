import type { PostMeta } from '@/lib/posts';
import { imageSize } from '@/lib/images';
import { UI, formatDate } from '@/lib/i18n';

type Props = {
  posts: PostMeta[];
  /** The newest article gets a wide card (blog home). */
  featured?: boolean;
  /** Show the EN/IT/FR badge: only useful when the list mixes languages. */
  showLang?: boolean;
  heading?: 'h2' | 'h3';
};

// Article cards: picture, date and reading time, title, summary and a visible "read" link,
// so it is obvious that the whole card opens the article.
export default function PostList({ posts, featured = false, showLang = true, heading = 'h2' }: Props) {
  const H = heading;
  return (
    <ul className={`posts${featured ? ' posts-featured' : ''}`}>
      {posts.map((p) => {
        const size = p.image ? imageSize(p.image) : null;
        const t = UI[p.lang];
        return (
          <li key={p.slug} lang={p.lang}>
            <a href={`/blog/${encodeURIComponent(p.slug)}/`}>
              {p.image && <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" decoding="async" width={size?.width} height={size?.height} />}
              <div className="card-body">
                <p className="card-meta">
                  <time dateTime={p.date}>{formatDate(p.date, p.lang)}</time>
                  <span aria-hidden="true"> · </span>{t.readMin.replace('{n}', String(p.readingMinutes))}
                  {showLang && <span className="lang">{p.lang.toUpperCase()}</span>}
                </p>
                <H>{p.title}</H>
                <p className="card-desc">{p.description}</p>
                <span className="card-more">{t.readMore} <span aria-hidden="true">→</span></span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
