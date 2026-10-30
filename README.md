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

## Cookie consent and Google Analytics 4
- GA4 property "Relomatrix Website", Measurement ID `G-BKQ2JPZCKY` (public, hardcoded in `lib/consent.ts`).
- `app/CookieConsent.tsx` shows a banner on first visit (Italian by default, English when the browser language is English or an element has `data-consent-lang="en"`).
- Google Consent Mode v2: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` default to `denied`. gtag.js is injected **only after** "Accetta statistiche"; before that no request goes to Google. Ads signals are never granted.
- The choice is stored in `localStorage` (`rmx_blog_consent_v1`) and in the `rmx_consent` cookie (180 days). Footer link "Preferenze cookie" reopens the banner; withdrawing sets consent back to denied and disables GA4.
- `/cookie` is the short cookie policy; the full privacy notice is https://relomatrix.com/legal. Legal wording must be reviewed by the compliance owner.
