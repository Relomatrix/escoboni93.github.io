// G-30: with assetPrefix '/blog' the pages reference /blog/_next/..., but `next build` still writes
// out/_next. Move it so that out/blog/ is the complete, self-contained blog.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const from = path.join(OUT, '_next');
const to = path.join(OUT, 'blog', '_next');
if (!fs.existsSync(from)) throw new Error('move-next-assets: out/_next not found (run next build first)');
fs.rmSync(to, { recursive: true, force: true });
fs.renameSync(from, to);

// Every page must point at /blog/_next, never at the root.
let pages = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      if (/(?:src|href)="\/_next\//.test(html)) throw new Error(`move-next-assets: ${p} still references /_next/`);
      pages++;
    }
  }
};
walk(path.join(OUT, 'blog'));
console.log(`move-next-assets: out/blog/_next in place, ${pages} page(s) checked`);
