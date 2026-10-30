import { getAllPosts } from '@/lib/posts';

export default function PostList() {
  const posts = getAllPosts();
  return (
    <>
      <h1>Relomatrix Blog</h1>
      <p className="lead">Source-referenced guides on relocation, immigration, tax and cross-border compliance.</p>
      <ul className="posts">
        {posts.map((p) => (
          <li key={p.slug} lang={p.lang}>
            <a href={`/blog/${p.slug}`}>
              {p.image && <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" />}
              <div>
                <time dateTime={p.date}>{p.date}</time> <span className="lang">{p.lang.toUpperCase()}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
