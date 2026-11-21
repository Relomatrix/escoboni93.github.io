// Static export has one root layout, so <html lang> is "en" everywhere. Rewrite it for Italian and
// French posts (and the Italian "chi siamo" page) in out/ after `next build`.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const OUT = path.join(process.cwd(), 'out');
const DIR = path.join(process.cwd(), 'content', 'posts');
const pages = [['blog/chi-siamo', 'it']];
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  const { data } = matter(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (data.lang === 'it' || data.lang === 'fr') pages.push([`blog/${data.slug || f.replace(/\.md$/, '')}`, data.lang]);
}
let n = 0;
for (const [page, lang] of pages) {
  const file = path.join(OUT, page, 'index.html');
  if (!fs.existsSync(file)) continue; // draft or future post
  const html = fs.readFileSync(file, 'utf8');
  const next = html.replace(/<html lang="en"/, `<html lang="${lang}"`);
  if (next === html) throw new Error(`set-html-lang: no <html lang="en"> in ${file}`);
  fs.writeFileSync(file, next);
  n++;
}
// Topic pages declare their language themselves (data-page-lang, app/blog/tag/[tag]/page.tsx).
const TAGS = path.join(OUT, 'blog', 'tag');
if (fs.existsSync(TAGS)) for (const d of fs.readdirSync(TAGS)) {
  const file = path.join(TAGS, d, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/data-page-lang="(it|fr)"/);
  if (!m) continue;
  fs.writeFileSync(file, html.replace(/<html lang="en"/, `<html lang="${m[1]}"`));
  n++;
}
console.log(`set-html-lang: ${n} page(s) set to lang="it"/"fr"`);
