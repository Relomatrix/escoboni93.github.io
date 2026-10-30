# Relomatrix Blog: SEO + AI-search (GEO/AEO) playbook

Distilled on 2026-10-30 from the free BabyLoveGrowth Academy (https://www.babylovegrowth.ai/en/academy). Each recommendation cites the lesson it comes from (short slug, full URL = `https://www.babylovegrowth.ai/en/academy/<slug>`; Claude lesson at `https://www.babylovegrowth.ai/en/academy/seo-geo-academy/claude-seo-analyst`).
All 30 priority lessons were fetched successfully (the Claude lesson 404s at `/academy/claude-seo-analyst` but loads at the `seo-geo-academy/` path). Shopify and Local-SEO academies were skipped by design.
Non-negotiable for Relomatrix: every legal/immigration/tax claim is sourced from an official source (gazzetta ufficiale, normattiva.it, agenziaentrate.gov.it, poliziadistato.it, esteri.it / vistoperitalia.esteri.it, interno.gov.it, integrazionemigranti.gov.it, INPS, travel.state.gov, uscis.gov, irs.gov, ssa.gov, service-public.fr, eur-lex.europa.eu, ec.europa.eu, OECD). No invented numbers.

## 1. What matters most (10 lines)
1. One article = one primary keyword + one search intent; never two posts on the same keyword (how-to-do-keyword-research, how-to-write-an-seo-blog-post).
2. Outline from what already ranks + "People also ask": the SERP is the brief (content-brief-template).
3. Answer first: a 40-60 word self-contained answer at the top, then TL;DR (how-to-write-an-seo-blog-post, make-content-ai-quotable).
4. Every paragraph must make sense lifted out of context; short paragraphs, descriptive H2s, lists (make-content-ai-quotable).
5. Trust signals: real author/reviewer names, cited sources, outbound links to authorities (geo-readiness-checklist, on-page-seo-checklist).
6. Go deep before wide: pillar + 5-10 interlinked cluster posts per topic (topical-authority-clusters, how-to-create-a-content-cluster).
7. FAQ + Article JSON-LD on every post; keep content in server-rendered HTML; don't block AI bots (structured-data-for-ai, how-ai-crawlers-work).
8. After publishing: in sitemap, request indexing, link from strongest existing pages (new-page-launch-checklist).
9. Use Search Console data: page-2 queries (pos 5-15) are the cheapest wins; refresh decaying pages monthly (phase-1-quick-wins, phase-2-make-it-compound).
10. Track AI visibility on a fixed prompt set across ChatGPT/Perplexity/Gemini/Claude; watch the trend, not a snapshot (track-your-ai-visibility, how-to-monitor-ai-mentions).

## 2. Article production checklist (daily routine)
### 2.1 Research (before writing)
- [ ] Pick from the cluster plan (section 3) or from GSC queries at positions 5-15 / page-2 gaps (how-to-find-keyword-gaps, phase-1-quick-wins).
- [ ] Classify intent: learn / compare / act. Low-volume "act" terms (e.g. "come richiedere codice fiscale dall'estero") beat big "what is" terms (how-to-do-keyword-research).
- [ ] Cannibalisation check: grep `content/posts` for the keyword and slug; if a post exists, update it instead (new-page-launch-checklist, how-to-do-a-content-audit).
- [ ] Look at the top 5 results + PAA for the query in the article's language; note H2s they cover and what they get wrong/miss (how-to-do-competitor-analysis, content-brief-template).
- [ ] Collect official sources first; if an essential fact can't be confirmed on an official page, drop the claim or mark it "da verificare" and do not publish it.

### 2.2 Brief template (fill before writing; content-brief-template)
```
keyword: ...            intent: learn|compare|act      lang: it|en
cluster/pillar: ...     working title + angle: ...
reader: (B2C mover | HR/relocation pro | law firm) and what they want
H2s (from SERP): ...
PAA questions -> FAQ: ...
internal links (>=3, incl. pillar): ...
official sources (URL + date checked): ...
CTA: Relomatrix report / B2B demo
length guide: in line with top results (no padding)
```
### 2.3 Structure of every post
1. Title (keyword near the start, <=60 chars) + one H1 only (how-to-optimize-a-page-for-seo).
2. Answer-first intro: 40-60 words, directly answering the query (how-to-write-an-seo-blog-post).
3. `## TL;DR` 3-5 bullets of plain facts (how-to-write-an-seo-blog-post, make-content-ai-quotable).
4. Body: descriptive H2s matching how people ask; tables for requirements/deadlines; "as of <date>" on anything that changes (fees, thresholds, procedures).
5. `## FAQ` from PAA, mirrored in frontmatter `faq` (drives FAQPage JSON-LD) (structured-data-for-ai, geo-readiness-checklist).
6. `## Sources` / `## Fonti`: official URLs with access date; inline links on the claim itself (geo-readiness-checklist, on-page-seo-checklist).
7. Internal links: >=3 descriptive anchors (pillar + 2 siblings), and add a link TO the new post from 1-2 strong existing posts (how-to-optimize-a-page-for-seo, new-page-launch-checklist).
8. Disclaimer line: general information, not legal advice; verify with the competent authority.
### 2.4 Meta, schema, media
- [ ] `description` ~150 chars, unique, benefit first, keyword natural (how-to-write-meta-descriptions).
- [ ] Short clean slug in the article language (how-to-optimize-a-page-for-seo).
- [ ] JSON-LD: BlogPosting + FAQPage (auto from frontmatter) (structured-data-for-ai).
- [ ] Cover image compressed (WebP/JPEG <200 KB), `imageAlt` descriptive, no stock-photo text claims (on-page-seo-checklist).
- [ ] `updated` set when refreshed (dateModified).
### 2.5 After publish
- [ ] Sitemap includes it (automatic), request indexing via GSC URL Inspection (new-page-launch-checklist, how-to-fix-indexing-issues).
- [ ] Log in tracker: date, slug, keyword, cluster, sources checked.

## 3. Topic-cluster plan (build one pillar + 3-4 posts first, then expand; how-to-create-a-content-cluster)
Legend: **[V]** = needs official-source verification of rules/numbers before publishing (all legal content does; [V] marks items with figures, deadlines or recently changed rules).

### C1. Cross-border employment & remote work (pillar exists: `cross-border-employment`)
- EN pillar: Cross-Border Employment: Risks, Rules and a Checklist (live)
- IT: Lavorare dall'estero per un'azienda italiana: obblighi fiscali e previdenziali [V]
- EN: Working remotely from Italy for a US employer: tax and visa basics [V]
- EN/IT: The 183-day rule explained (what treaties actually say) / La regola dei 183 giorni [V]
- EN: Permanent establishment risk from remote employees [V]
- IT: Distacco UE e modulo A1: quando serve [V]
- EN: US-Italy totalization agreement: who pays social security [V]
- IT: Smart working transfrontaliero nell'UE: accordo quadro sulla legislazione applicabile [V]
- EN: Employer of Record vs local entity for hiring in Italy
- EN: Cross-border assignment document checklist for HR

### C2. US -> Italy corridor
- EN pillar: Moving from the US to Italy: visas, tax and registrations step by step [V]
- EN: Italy elective residence visa requirements [V]
- EN: Italy work visa and the decreto flussi explained [V]
- EN: Italian citizenship by descent (jure sanguinis): current rules [V] (rules changed in 2025; verify on official sources)
- EN: US taxes when living in Italy: FBAR, FEIT and the treaty [V]
- EN: Italy's impatriate tax regime (regime impatriati) for US movers [V]
- EN: Driving in Italy with a US license: conversion rules [V]
- IT: Trasferirsi dagli USA in Italia: guida per famiglie italo-americane [V]
- EN: Shipping belongings to Italy: customs transfer-of-residence relief [V]

### C3. France <-> Italy & EU mobility
- EN/IT pillar: Moving between France and Italy: residence, tax and social security / Trasferirsi tra Francia e Italia [V]
- IT: Iscrizione all'AIRE: quando è obbligatoria [V]
- IT: Frontalieri Italia-Francia: tassazione [V]
- EN: EU citizens registering residence in Italy (attestazione di soggiorno) [V]
- EN: Non-EU family member of an EU citizen moving to Italy [V]
- IT: Convenzione Italia-Francia contro le doppie imposizioni: punti chiave [V]
- EN: Transferring health coverage from France to Italy (S1 form) [V]
- IT: Cambio residenza dall'estero: checklist comune per comune

### C4. Arriving in Italy: core documents
- IT/EN pillar: Primi documenti in Italia / First documents in Italy: complete checklist
- IT/EN: Codice fiscale dall'estero: come richiederlo (consolato o Agenzia Entrate) [V]
- IT/EN: Permesso di soggiorno: tipi, kit postale e tempi [V]
- IT: Rinnovo del permesso di soggiorno: quando e come [V]
- EN: Permesso di soggiorno for work vs study vs family: differences [V]
- IT/EN: Iscrizione al Servizio Sanitario Nazionale per stranieri [V]
- IT: Residenza anagrafica per cittadini stranieri [V]
- EN: Opening an Italian bank account as a newcomer
- IT: Conversione della patente estera [V]

### C5. Digital nomads & remote workers in Italy/EU
- EN/IT pillar: Italy digital nomad visa: complete guide / Visto nomadi digitali Italia [V]
- EN: Italy digital nomad visa income requirement and documents [V]
- EN: Digital nomad visa vs elective residence visa vs self-employment visa [V]
- IT: Partita IVA forfettaria per nomadi digitali residenti in Italia [V]
- EN: Tax residency in Italy for remote workers: when it starts [V]
- EN: Schengen 90/180 rule for remote workers (EES/ETIAS context) [V]
- EN: Comparing EU digital nomad visas: Italy, Spain, Portugal, Greece [V]
- IT: Lavoratori da remoto extra-UE: assicurazione sanitaria obbligatoria [V]
- EN: Remote work from Italy: compliance checklist for employers [V]

Publishing rule: alternate IT/EN; translations of the same topic are linked as language versions (needs hreflang, see 4), not treated as separate keywords.

## 4. Technical checklist vs repo (/workspace/relomatrix_blog @ e156a1f)
| Item | Status | Note / lesson |
|---|---|---|
| XML sitemap (`app/sitemap.ts`) | DONE | lists /blog + posts with lastModified; submit in GSC once live (how-to-submit-a-sitemap) |
| robots.txt (`app/robots.ts`) | DONE | allow all + sitemap; AI bots not blocked (how-ai-crawlers-work) |
| Canonical per post & /blog | DONE | `alternates.canonical` (on-page-seo-checklist) |
| BlogPosting + FAQPage JSON-LD | DONE | from frontmatter (structured-data-for-ai) |
| Open Graph / Twitter / RSS | DONE | |
| Server-rendered HTML (SSG) | DONE | content in HTML, `dynamicParams=false` (how-ai-crawlers-work) |
| Drafts/future posts hidden | DONE | `draft`, future date filter |
| GA4 G-BKQ2JPZCKY behind consent | DONE (in code) | verify in Realtime after deploy, add key events, link GSC (how-to-set-up-ga4) |
| hreflang it/en | **MISSING** | no translation key in frontmatter, no `alternates.languages`, sitemap lacks alternates. Add `translationOf`/`i18nKey` field |
| `<html lang>` per language | **PARTIAL** | root is always `en`; article has `lang` attr. Make root lang follow post or use /it /en segments |
| llms.txt | **MISSING** | add `public/llms.txt` (or route) listing pillars + about/sources policy; optional, cheap (llms-txt-explained) |
| Author/reviewer (Person) + credentials | **MISSING** | only Organization author; add named reviewer + about page (geo-readiness-checklist) |
| Organization/WebSite JSON-LD, BreadcrumbList | **MISSING** | nice-to-have (structured-data-for-ai) |
| Cluster/tag hub pages | **MISSING** | `tags` exists in type but no /blog/tag or pillar hub; needed for clusters (how-to-create-a-content-cluster) |
| Related-posts internal links block | **MISSING** | only manual links (how-to-optimize-a-page-for-seo) |
| Image optimisation | **PARTIAL** | plain `<img>` without width/height/lazy; use next/image or set dims, WebP (technical-seo-checklist) |
| Core Web Vitals / speed | UNVERIFIED | run PageSpeed after deploy (technical-seo-checklist) |
| HTTPS, no redirect chains | UNVERIFIED | Vercel default HTTPS; `/`->`/blog` is 307, consider permanent (technical-seo-checklist) |
| Sources section enforced | **PARTIAL** | PUBLISHING.md asks for `## Sources`; add a build/lint check that fails without it and without >=1 official link |
| GSC property blog.relomatrix.com | **MISSING** | domain property covers it; submit sitemap after go-live (how-to-set-up-google-search-console) |
| Single H1 | DONE | layout uses logo img, post uses one h1 |

## 5. AI-visibility monitoring routine (weekly, Monday; track-your-ai-visibility, how-to-monitor-ai-mentions)
Engines: ChatGPT (search on), Perplexity, Google (AI Overview + top 10), Gemini, Claude, Bing Copilot. Fresh/logged-out session where possible; run each prompt once, same wording every week.
Prompt set (IT + EN, ~12):
1. "Come richiedere il codice fiscale dall'estero?" / "How do I get an Italian codice fiscale from abroad?"
2. "Documenti per il permesso di soggiorno per lavoro" / "Italy permesso di soggiorno documents"
3. "Italy digital nomad visa requirements"
4. "Moving from the US to Italy checklist"
5. "Tasse lavorando da remoto in Italia per azienda estera"
6. "Cross-border employment compliance risks"
7. "Best relocation compliance software for law firms" / "software compliance relocation per studi legali"
8. "Tool to check immigration and tax risks before relocating to Italy"
9. "What is Relomatrix?" / "Relomatrix è affidabile?" (brand)
10. "France to Italy relocation tax social security"
Log per prompt (sheet / CSV `ai_visibility.csv`): date, engine, prompt, Relomatrix named (y/n), our URL cited (which), competitors named, cited source domains, answer accuracy note (flag if an AI states something wrong about us or the law).
Also monthly: GA4 referral sessions from chatgpt.com, perplexity.ai, gemini.google.com, claude.ai, copilot.microsoft.com and their landing pages (claude-seo-analyst prompt 02).
Act: for prompts where we're absent but competitors are cited, improve/create the matching page (answer-first, FAQ, sources) and re-check (how-to-monitor-ai-mentions).

## 6. 100-day plan adapted (get-set-up, phase-1-quick-wins, phase-2-make-it-compound, phase-3-authority-and-proof)
Starting line (from GSC, 28 days to 2026-10-30): 4 clicks, 34 impressions, avg pos 5.3; GA4 created, no data yet. Save baseline in `baseline.md` on day 0 (get-set-up). We use GSC/GA4 directly via our own access, not the BLG MCP.
- **Days 0-30 (plumbing + roadmap):** deploy blog, CNAME switch by Francesco, GA4 tag live + Realtime check, submit sitemap, fix gaps from section 4 (hreflang, llms.txt, author, hub pages). Publish pillars for C1-C5 + first cluster posts. Rewrite titles of any page with impressions but 0 clicks. Build keyword roadmap from GSC queries (phase-1-quick-wins).
- **Days 30-60 (rhythm):** daily post; every Monday: GSC queries pos 5-15 with impressions -> one on-page change each, AI prompt check; monthly: refresh slipping pages and re-verify sources for changed rules (phase-2-make-it-compound).
- **Days 60-100 (authority):** update posts at pos 8-20 with depth and links; complete one cluster to 5-7+ posts all linked to its hub; polish answer boxes for snippets/AI (phase-3-authority-and-proof). Earn mentions legitimately: partner law firms/relocation companies linking to guides, Relomatrix on relevant directories, data-backed (real, sourced) explainers. Day 100: compare against baseline.
- **Quarterly:** content audit keep/improve/merge/remove with 301s (how-to-do-a-content-audit); technical checklist (technical-seo-checklist); competitor + keyword-gap review (how-to-do-competitor-analysis).

## 7. What we deliberately do NOT replicate
- **Reddit/Quora "brand mentions" by bots** (BLG product feature; lesson how-to-get-into-chatgpt-answers suggests a *genuinely helpful* forum presence): we do no automated or fake posts. Only real, disclosed answers by a person, if ever.
- **Stripping C2PA / AI metadata from images:** misleading; we keep provenance.
- **Backlink exchange network / bought links:** link schemes violate Google spam policies and are risky for a legal-compliance brand. We earn links (partners, citations).
- **Mass auto-publishing without verification:** we publish daily automatically, but a post that fails the source check is not published. Volume never beats accuracy here.
- **Copying/spinning competitor content:** gap analysis informs topics only; text is original (how-to-do-competitor-analysis: "not cloning").
- **Invented statistics or case studies, testimonial quotes:** none without a verifiable source.
- **BLG MCP connector / paid tools:** not needed; we read GSC/GA4 with our own read-only access.
- **llms.txt as a ranking lever:** we add it as a cheap experiment only (llms-txt-explained).
