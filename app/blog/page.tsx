import PostList from '../PostList';
import { getAllPosts, getAllTags } from '@/lib/posts';

export const metadata = { alternates: { canonical: '/blog/' } };

export default function Page() {
  const tags = getAllTags();
  return (
    <>
      <h1>Relomatrix Blog</h1>
      <p className="lead">Source-referenced guides on relocation, immigration, tax and cross-border compliance.</p>
      {!!tags.length && (
        <nav className="tag-cloud" aria-label="Topics">
          {tags.map((t) => <a key={t.slug} href={`/blog/tag/${t.slug}/`}>{t.label}</a>)} <a href="/blog/tag/">All topics / Tutti gli argomenti</a>
        </nav>
      )}
      <PostList posts={getAllPosts()} />
    </>
  );
}
