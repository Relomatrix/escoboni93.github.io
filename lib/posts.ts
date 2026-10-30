import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { imageSize } from './images';

export type Faq = { q: string; a: string };
export type Lang = 'it' | 'en';
export type PostMeta = {
  title: string; description: string; date: string; updated?: string; slug: string;
  lang: Lang; image?: string; imageAlt?: string; author?: string; tags?: string[];
  translationKey?: string; faq?: Faq[]; draft?: boolean;
};
export type Post = PostMeta & { html: string };

const DIR = path.join(process.cwd(), 'content', 'posts');

export const tagSlug = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function read(file: string): { meta: PostMeta; body: string } {
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const slug = String(data.slug || file.replace(/\.md$/, ''));
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  if (!data.title || !data.description || !date) throw new Error(`Missing frontmatter in ${file}`);
  // Slug and image end up in URLs: only allow safe shapes (scripts/check-posts.mjs reports the same rules).
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid slug "${slug}" in ${file}`);
  if (data.image !== undefined && (!/^\/images\/[\w\-./]+$/.test(String(data.image)) || String(data.image).includes('..'))) throw new Error(`Invalid image path in ${file}`);
  return { meta: { ...data, slug, date, lang: data.lang === 'it' ? 'it' : 'en' } as PostMeta, body: content };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => read(f).meta)
    .filter((p) => !p.draft && new Date(p.date) <= new Date(Date.now() + 864e5))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Language versions of the same article (shared translationKey), including the post itself.
export function getTranslations(p: PostMeta): PostMeta[] {
  if (!p.translationKey) return [p];
  return getAllPosts().filter((o) => o.translationKey === p.translationKey);
}

// hreflang map for a post: { it: url, en: url, 'x-default': url } or undefined when there is one version.
export function hreflang(p: PostMeta, base: string): Record<string, string> | undefined {
  const versions = getTranslations(p);
  if (versions.length < 2) return undefined;
  const map: Record<string, string> = {};
  for (const v of versions) map[v.lang] = `${base}/blog/${v.slug}/`;
  map['x-default'] = map.en || map[versions[0].lang];
  return map;
}

// Up to n posts sharing the most tags, same language first, newest first; excludes translations.
export function getRelated(p: PostMeta, n = 3): PostMeta[] {
  const mine = new Set((p.tags || []).map(tagSlug));
  const skip = new Set(getTranslations(p).map((t) => t.slug));
  return getAllPosts()
    .filter((o) => !skip.has(o.slug))
    .map((o) => ({ o, score: (o.tags || []).filter((t) => mine.has(tagSlug(t))).length * 2 + (o.lang === p.lang ? 1 : 0) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score || (a.o.date < b.o.date ? 1 : -1))
    .slice(0, n).map((x) => x.o);
}

export type Tag = { slug: string; label: string; posts: PostMeta[] };
export function getAllTags(): Tag[] {
  const map = new Map<string, Tag>();
  for (const p of getAllPosts()) for (const t of p.tags || []) {
    const slug = tagSlug(t);
    if (!slug) continue;
    if (!map.has(slug)) map.set(slug, { slug, label: t, posts: [] });
    map.get(slug)!.posts.push(p);
  }
  return [...map.values()].sort((a, b) => b.posts.length - a.posts.length || a.label.localeCompare(b.label));
}

// rehype plugin: lazy-load body images and give them intrinsic width/height.
function rehypeImages() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const props = node.properties || (node.properties = {});
        props.loading = 'lazy';
        props.decoding = 'async';
        const size = typeof props.src === 'string' ? imageSize(props.src) : null;
        if (size && !props.width) { props.width = size.width; props.height = size.height; }
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = fs.readdirSync(DIR).find((f) => f.endsWith('.md') && read(f).meta.slug === slug);
  if (!file) return null;
  const { meta, body } = read(file);
  const html = String(await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeImages).use(rehypeStringify).process(body));
  return { ...meta, html };
}
