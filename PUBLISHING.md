# Publishing an article

Every push to `main` triggers a Vercel production deploy (once the repo is imported on Vercel).

## Daily routine
1. Write the article as Markdown: `content/posts/<slug>.md`. The slug is the URL: `/blog/<slug>`. Lowercase, hyphens, unique, never change it after publishing.
2. Put images in `public/images/posts/<slug>/` and reference them as `/images/posts/<slug>/<file>`. Do not hotlink external images.
3. Run `npm ci && npm run build` (must pass).
4. Commit and push to `main`: `git add content public && git commit -m "post: <slug>" && git push origin main`.
5. Vercel builds and publishes; the post appears on `/blog`, in `/sitemap.xml` and `/rss.xml`.

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
author: "Relomatrix"      # optional
tags: ["tax", "italy"]    # optional
faq:                      # optional, emitted as FAQPage JSON-LD
  - q: "Question?"
    a: "Answer."
draft: false              # optional
---
```
Body: standard Markdown (GFM tables supported). Headings get automatic ids (e.g. `## The risks people miss` -> `#the-risks-people-miss`). Cite sources in a `## Sources` section.

## Analytics and cookies (do not break)
- Never add `<script>` tags for analytics or third-party trackers directly in pages or posts. All analytics goes through `lib/consent.ts` (GA4 `G-BKQ2JPZCKY`, loaded only after consent).
- Do not embed third-party iframes (YouTube, maps, social widgets) in posts: they set cookies before consent. Use a link or a local image instead.
- Keep the footer links Privacy, Cookie policy and "Preferenze cookie".
