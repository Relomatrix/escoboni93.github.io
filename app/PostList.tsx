import type { PostMeta } from '@/lib/posts';
import { imageSize } from '@/lib/images';

export default function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="posts">
      {posts.map((p) => {
        const size = p.image ? imageSize(p.image) : null;
        return (
          <li key={p.slug} lang={p.lang}>
            <a href={`/blog/${p.slug}/`}>
              {p.image && <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" decoding="async" width={size?.width} height={size?.height} />}
              <div>
                <time dateTime={p.date}>{p.date}</time> <span className="lang">{p.lang.toUpperCase()}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
