# Publishing an article

Every push to `main` triggers the GitHub Actions workflow that builds the static site and deploys it to GitHub Pages. A scheduled run every day at 05:15 UTC publishes future-dated posts whose date has arrived.

## Daily routine
1. Write the article as Markdown: `content/posts/<slug>.md`. The slug is the URL: `/blog/<slug>`. Lowercase, hyphens, unique, never change it after publishing.
2. Put images in `public/images/posts/<slug>/` and reference them as `/images/posts/<slug>/<file>`. Do not hotlink external images.
3. Run `npm ci && npm run build` (must pass). `npm run check` runs only the content gate (see below).
4. Commit and push to `main`: `git add content public && git commit -m "post: <slug>" && git push origin main`.
5. GitHub Actions builds and publishes to Pages (check the Actions tab is green); the post appears on `/blog`, in `/sitemap.xml` and `/rss.xml`.

Posts with `draft: true` or a `date` more than 1 day in the future are not published.

## Frontmatter schema
```yaml
---
title: "Required. H1 and <title>"
description: "Required. Meta description, 120-160 chars"
date: "2026-10-30"        # required, YYYY-MM-DD, publication date
updated: "2026-11-02"     # optional, dateModified
slug: "my-article-slug"   # required, URL path /blog/<slug>
lang: "en"                # required, "en" or "it"
image: "/images/posts/my-article-slug/cover.jpeg"  # optional, cover + Open Graph
imageAlt: "Alt text"      # optional
author: "redazione"       # optional, key of lib/authors.ts (default: redazione)
tags: ["Remote work", "Italy"]  # recommended: each tag gets a hub page /blog/tag/<tag>/ and drives related articles
translationKey: "cbe"     # optional: same value on the IT and EN versions of one article -> hreflang + language switch
faq:                      # required (>= 1), emitted as FAQPage JSON-LD
  - q: "Question?"
    a: "Answer."
draft: false              # optional
---
```
Body: standard Markdown (GFM tables supported). Headings get automatic ids (e.g. `## The risks people miss` -> `#the-risks-people-miss`). Cite sources in a `## Sources` (en) or `## Fonti` (it) section.

## Content gate (`scripts/check-posts.mjs`, runs before every build)
The build fails, so the post is not published, when a post:
- misses `title`, `description`, `date` (YYYY-MM-DD), `slug`, `lang` (`it`/`en`) or `faq`;
- has a slug that is not lowercase-with-hyphens, is reserved (`tag`) or is already used;
- has no `## Sources` / `## Fonti` section, or that section has no link to an **official source** (government, EU, OECD/ILO/UN and the Italian, French, US, UK, AR, BR institutions listed in the script);
- uses an external image, a missing image or an image over 200 KB;
- contains `<script>` or `<iframe>`;
- reuses a `translationKey` for the same language, or names an `author` not in `lib/authors.ts`.
Warnings (do not fail): opening paragraph outside ~40-60 words, description outside 120-160 chars, title over 60, no tags, image without `imageAlt`.

## Language
`lang: it` posts get `<html lang="it">` (rewritten after the build by `scripts/set-html-lang.mjs`) and Italian UI labels. Link the two versions of a translated article with the same `translationKey`.

## Analytics and cookies (do not break)
- Never add `<script>` tags for analytics or third-party trackers directly in pages or posts. All analytics goes through `lib/consent.ts` (GA4 `G-BKQ2JPZCKY`, loaded only after consent).
- Do not embed third-party iframes (YouTube, maps, social widgets) in posts: they set cookies before consent. Use a link or a local image instead.
- Keep the footer links Privacy, Cookie policy and "Preferenze cookie".
