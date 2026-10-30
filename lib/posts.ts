import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

export type Faq = { q: string; a: string };
export type PostMeta = {
  title: string; description: string; date: string; updated?: string; slug: string;
  lang: 'it' | 'en'; image?: string; imageAlt?: string; author?: string; tags?: string[];
  faq?: Faq[]; draft?: boolean;
};
export type Post = PostMeta & { html: string };

const DIR = path.join(process.cwd(), 'content', 'posts');

function read(file: string): { meta: PostMeta; body: string } {
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const slug = String(data.slug || file.replace(/\.md$/, ''));
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  if (!data.title || !data.description || !date) throw new Error(`Missing frontmatter in ${file}`);
  return { meta: { ...data, slug, date, lang: data.lang === 'it' ? 'it' : 'en' } as PostMeta, body: content };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => read(f).meta)
    .filter((p) => !p.draft && new Date(p.date) <= new Date(Date.now() + 864e5))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = fs.readdirSync(DIR).find((f) => f.endsWith('.md') && read(f).meta.slug === slug);
  if (!file) return null;
  const { meta, body } = read(file);
  const html = String(await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(body));
  return { ...meta, html };
}
