# Relomatrix Blog

Self-owned Next.js (App Router, static generation) blog for https://blog.relomatrix.com. Articles live in `content/posts/*.md`. See [PUBLISHING.md](PUBLISHING.md).

Routes: `/blog`, `/blog/<slug>`, `/sitemap.xml`, `/robots.txt`, `/rss.xml` (`/` redirects to `/blog`; URLs match the previous BabyLoveGrowth blog 1:1).

## Local
```
npm ci
npm run dev     # http://localhost:3000/blog
npm run build
```

## Deploy on Vercel (3 steps)
1. On https://vercel.com/new choose **Import Git Repository** and select `Relomatrix/relomatrix-blog` (grant the Vercel GitHub app access to this repo if it is not listed).
2. Keep the detected defaults (Framework: Next.js, Build: `next build`, Root: `./`, Node 20+). Optional env var: `NEXT_PUBLIC_SITE_URL=https://blog.relomatrix.com` (it is already the default). Click **Deploy** and check the `*.vercel.app` preview.
3. Only when the preview is verified: Project > Settings > Domains > add `blog.relomatrix.com`, remove the domain from the old BabyLoveGrowth project, and point the DNS CNAME to the value Vercel shows.

No secrets are needed or stored in this repo.
