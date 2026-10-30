# Relomatrix Blog

Self-owned Next.js (App Router, static generation) blog for https://blog.relomatrix.com. Articles live in `content/posts/*.md`. See [PUBLISHING.md](PUBLISHING.md).

Routes: `/blog`, `/blog/<slug>`, `/blog/tag/`, `/blog/tag/<tag>`, `/chi-siamo`, `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/llms.txt` (`/` meta-refreshes to `/blog/`; URLs match the previous BabyLoveGrowth blog 1:1).

## Local
```
npm ci
npm run dev     # http://localhost:3000/blog
npm run build   # content check + static site in out/
npm run check   # content check only (scripts/check-posts.mjs)
npx serve out   # preview the export
```

## Deploy on GitHub Pages (free)
The site is a fully static export (`output: 'export'`, built into `out/`). `.github/workflows/deploy.yml` builds and deploys on every push to `main`, once a day (05:15 UTC, so future-dated posts go live) and on manual run.

1. The code lives in the public repo `Relomatrix/escoboni93.github.io` (an existing, previously empty Pages repo; the name does not matter with a custom domain). On the Free plan **GitHub Pages only works on PUBLIC repositories**. The repo contains no secrets.
2. Push this code to `main`.
3. Settings > Pages > Build and deployment > Source = **GitHub Actions**. Wait for the "Deploy to GitHub Pages" workflow to go green (Actions tab).
4. Settings > Pages > Custom domain = `blog.relomatrix.com` (the file `public/CNAME` already contains it). Until DNS points to GitHub the check will show a DNS warning: that is expected.
5. Verify the site at its github.io URL first. Note: with a custom domain set, the project URL `https://relomatrix.github.io/relomatrix-blog/` redirects to the custom domain; to preview before the DNS switch, check the Actions run artifact or temporarily leave the custom domain empty (then assets load from `/` and break under the `/relomatrix-blog/` subpath, so preview is best done locally with `npx serve out`).
6. DNS (last step, only after the new site is verified): at Register.it change `blog` CNAME from the current Vercel value to `relomatrix.github.io.` Then disable the domain on the old BabyLoveGrowth/Vercel project.
7. When GitHub has issued the certificate (can take up to ~1 hour after DNS), tick **Enforce HTTPS** in Settings > Pages.

Pitfall: the Pages hostname of an org is `<orgname>.github.io` lowercase, so `Relomatrix` -> `relomatrix.github.io`. The org already has a repo `escoboni93.github.io` with Pages; that does not conflict with this project site.

### Static export limits
- No server redirects or custom headers. `/` is a static page with `<meta http-equiv="refresh">` + canonical to `/blog/` (noindex). GitHub Pages answers `/blog/<slug>` with a 301 to `/blog/<slug>/` (trailingSlash), so old URLs without slash keep working; canonical, sitemap and RSS use the trailing-slash form.
- `sitemap.xml`, `robots.txt`, `rss.xml` are generated at build time (`force-static`).
- Images are served as-is (`images.unoptimized`); compress them before committing.
- `404.html` is the custom not-found page served by Pages.
- Security headers (CSP, X-Frame-Options) cannot be set on Pages.

No secrets are needed or stored in this repo.

## Cookie consent and Google Analytics 4
- GA4 property "Relomatrix Website", Measurement ID `G-BKQ2JPZCKY` (public, hardcoded in `lib/consent.ts`).
- `app/CookieConsent.tsx` shows a banner on first visit (Italian by default, English when the browser language is English or an element has `data-consent-lang="en"`).
- Google Consent Mode v2: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` default to `denied`. gtag.js is injected **only after** "Accetta statistiche"; before that no request goes to Google. Ads signals are never granted.
- The choice is stored in `localStorage` (`rmx_blog_consent_v1`) and in the `rmx_consent` cookie (180 days). Footer link "Preferenze cookie" reopens the banner; withdrawing sets consent back to denied and disables GA4.
- `/cookie` is the short cookie policy; the full privacy notice is https://relomatrix.com/legal. Legal wording must be reviewed by the compliance owner.
