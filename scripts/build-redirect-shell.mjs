// G-30: blog.relomatrix.com becomes a redirect shell once relomatrix.com/blog/ serves the blog.
// GitHub Pages cannot answer with an HTTP 301, so every old URL gets a page with an instant meta
// refresh and a canonical to the same path on relomatrix.com (Google treats an instant meta refresh
// as a permanent redirect). Output: out-redirect/, deployed by .github/workflows/deploy.yml only
// after it has checked that relomatrix.com/blog/ is live.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const SHELL = path.join(process.cwd(), 'out-redirect');
const TARGET = (process.env.BLOG_CANONICAL_ORIGIN || 'https://www.relomatrix.com').replace(/\/$/, '');

// Old paths that moved under /blog/ with G-30.
const MOVED = { '/': '/blog/', '/chi-siamo/': '/blog/chi-siamo/', '/cookie/': '/blog/cookie/' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function redirectPage(to) {
  const url = esc(to);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Relomatrix Blog</title>`
    + `<link rel="canonical" href="${url}"><meta name="robots" content="noindex">`
    + `<meta http-equiv="refresh" content="0; url=${url}">`
    + `<script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script>`
    + `</head><body><p><a href="${url}">${url}</a></p></body></html>\n`;
}

function write(rel, body) {
  const file = path.join(SHELL, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

if (!fs.existsSync(path.join(OUT, 'blog'))) throw new Error('build-redirect-shell: out/blog not found');
fs.rmSync(SHELL, { recursive: true, force: true });

let pages = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_next') walk(p); continue; }
    if (e.name !== 'index.html') continue;
    const rel = path.relative(OUT, p);
    const urlPath = `/${path.dirname(rel).split(path.sep).join('/')}/`;
    write(rel, redirectPage(`${TARGET}${urlPath}`));
    pages++;
  }
};
walk(path.join(OUT, 'blog'));
for (const [from, to] of Object.entries(MOVED)) {
  write(path.join(from.slice(1), 'index.html'), redirectPage(`${TARGET}${to}`));
  pages++;
}

const notFoundScript = `var p=location.pathname;var m=${JSON.stringify(MOVED)};`
  + `var to=p.indexOf('/blog/')===0?p:(m[p]||m[p+'/']||'/blog/');`
  + `location.replace(${JSON.stringify(TARGET)}+to+location.search+location.hash)`;
write('404.html', `<!doctype html><html><head><meta charset="utf-8"><title>Relomatrix Blog</title>`
  + `<meta name="robots" content="noindex"><script>${notFoundScript}</script></head>`
  + `<body><p><a href="${TARGET}/blog/">${TARGET}/blog/</a></p></body></html>\n`);

// Feed readers and crawlers keep working on the old host until they pick up the new URLs.
// relomatrix.com/blog/ is rebuilt only when the main site is released, while this host is rebuilt every
// day: a post published in between would be announced here (sitemap, RSS) before it exists there, and
// Google would find the home page at its URL. With BLOG_SHELL_MIRROR_LIVE=1 (deploy.yml) these files are
// copied from the live relomatrix.com/blog/ instead, so the old host lists only what is really online.
async function liveCopy(f) {
  if (process.env.BLOG_SHELL_MIRROR_LIVE !== '1') return null;
  try {
    const res = await fetch(`${TARGET}/blog/${f}`, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const body = await res.text();
    const ok = res.ok && (f === 'llms.txt' ? body.length > 0 : /<(urlset|rss)[\s>]/.test(body));
    if (!ok) console.warn(`build-redirect-shell: live ${f} not usable (${res.status}), using the local build`);
    return ok ? body : null;
  } catch (e) {
    console.warn(`build-redirect-shell: live ${f} not reachable (${e?.message || e}), using the local build`);
    return null;
  }
}
for (const f of ['rss.xml', 'sitemap.xml', 'llms.txt']) {
  const src = path.join(OUT, 'blog', f);
  const body = (await liveCopy(f)) ?? (fs.existsSync(src) ? fs.readFileSync(src) : null);
  if (body != null) { write(path.join('blog', f), body); write(f, body); }
}
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${TARGET}/blog/sitemap.xml\n`);
const cname = path.join(process.cwd(), 'public', 'CNAME');
if (fs.existsSync(cname)) write('CNAME', fs.readFileSync(cname));
console.log(`build-redirect-shell: ${pages} redirect page(s) to ${TARGET} in out-redirect/`);
