// Pre-build gate for content/posts (see PUBLISHING.md). Fails the build, so a post that breaks a rule
// is never published. Warnings are printed but do not fail.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'posts');
const MAX_IMAGE_BYTES = 200 * 1024;
const RESERVED = new Set(['tag']); // static routes under /blog/
const AUTHORS = new Set(['redazione']); // keep in sync with lib/authors.ts

// Official sources: government, EU and international bodies (SEO_PLAYBOOK.md, "non-negotiable").
const OFFICIAL_SUFFIXES = ['.gov', '.gov.it', '.gouv.fr', '.gov.uk', '.gob.ar', '.gov.br', '.leg.br', '.jus.br', 'europa.eu', '.int'];
const OFFICIAL_HOSTS = [
  'gazzettaufficiale.it', 'normattiva.it', 'inps.it', 'inail.it', 'esteri.it', 'vistoperitalia.esteri.it', 'interno.gov.it',
  'poliziadistato.it', 'integrazionemigranti.gov.it', 'agenziaentrate.gov.it', 'camera.it', 'senato.it', 'cortecostituzionale.it',
  'giustizia.it', 'lavoro.gov.it', 'istat.it', 'bancaditalia.it', 'service-public.fr', 'legifrance.gouv.fr', 'impots.gouv.fr',
  'cleiss.fr', 'urssaf.fr', 'ameli.fr', 'oecd.org', 'ilo.org', 'un.org', 'imf.org', 'worldbank.org', 'legislation.gov.uk',
  'congress.gov', 'ecfr.gov', 'federalregister.gov', 'irs.gov', 'ssa.gov', 'uscis.gov', 'state.gov', 'infoleg.gob.ar',
  'boe.es', 'planalto.gov.br', 'in.gov.br',
];
export const isOfficial = (url) => {
  let host;
  try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return false; }
  return OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) || OFFICIAL_SUFFIXES.some((s) => host.endsWith(s));
};

const errors = [];
const warnings = [];
const seen = new Map();
const translations = new Map();

const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.md')) : [];
for (const f of files) {
  const err = (m) => errors.push(`${f}: ${m}`);
  const warn = (m) => warnings.push(`${f}: ${m}`);
  let parsed;
  try { parsed = matter(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (e) { err(`invalid frontmatter (${e.message})`); continue; }
  const { data, content } = parsed;
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
  const slug = String(data.slug || f.replace(/\.md$/, ''));

  for (const k of ['title', 'description', 'date', 'slug', 'lang']) if (!data[k]) err(`missing frontmatter "${k}"`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) err(`date must be YYYY-MM-DD, got "${date}"`);
  if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated))) err('updated must be YYYY-MM-DD');
  if (!['it', 'en'].includes(data.lang)) err(`lang must be "it" or "en", got "${data.lang}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) err(`slug "${slug}" must be lowercase words separated by hyphens`);
  if (RESERVED.has(slug)) err(`slug "${slug}" is reserved`);
  if (seen.has(slug)) err(`slug "${slug}" already used by ${seen.get(slug)}`); else seen.set(slug, f);
  if (data.author && !AUTHORS.has(data.author)) err(`unknown author "${data.author}" (add it to lib/authors.ts and scripts/check-posts.mjs)`);
  if (data.title && String(data.title).length > 70) warn(`title is ${String(data.title).length} chars (aim for <= 60)`);
  const dl = String(data.description || '').length;
  if (dl && (dl < 70 || dl > 170)) warn(`description is ${dl} chars (aim for 120-160)`);
  if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== 'string' || !t.trim()))) err('tags must be a list of non-empty strings');
  if (!Array.isArray(data.tags) || !data.tags.length) warn('no tags: the post will not appear in any topic hub');

  if (!Array.isArray(data.faq) || !data.faq.length) err('missing frontmatter "faq" (at least one {q, a})');
  else if (data.faq.some((x) => !x || !x.q || !x.a)) err('every faq entry needs q and a');

  if (data.translationKey) {
    const k = `${data.translationKey}:${data.lang}`;
    if (translations.has(k)) err(`translationKey "${data.translationKey}" already has a "${data.lang}" version (${translations.get(k)})`);
    translations.set(k, f);
  }

  // Sources section: "## Sources" (en) or "## Fonti" (it), with at least one official link.
  const m = content.match(/^##\s+(Sources|Fonti)\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m);
  if (!m) err('missing "## Sources" / "## Fonti" section');
  else {
    const links = [...m[2].matchAll(/\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>/g)].map((x) => x[1] || x[2]);
    if (!links.length) err('Sources section has no links');
    else if (!links.some(isOfficial)) err(`Sources section has no official source (${links.length} link(s), none on an official domain)`);
  }

  // Answer first: the first paragraph should be a 40-60 word direct answer.
  const first = content.replace(/^\s+/, '').split(/\n\s*\n/)[0] || '';
  const words = first.replace(/[#*_`>[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  if (first.startsWith('#') || words < 30 || words > 90) warn(`opening paragraph is ${words} words (answer first in 40-60 words)`);

  // Local images exist and are compressed.
  const imgs = [data.image, ...[...content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((x) => x[1])].filter(Boolean);
  for (const src of imgs) {
    if (/^https?:/.test(src)) { err(`external image ${src}: put it in public/images/posts/${slug}/`); continue; }
    const file = path.join(ROOT, 'public', src);
    if (!fs.existsSync(file)) { err(`image not found: ${src}`); continue; }
    const size = fs.statSync(file).size;
    if (size > MAX_IMAGE_BYTES) err(`image ${src} is ${Math.round(size / 1024)} KB (max ${MAX_IMAGE_BYTES / 1024} KB, compress it)`);
  }
  if (data.image && !data.imageAlt) warn('image without imageAlt');
  if (/<script|<iframe/i.test(content)) err('no <script> or <iframe> in posts (consent and PUBLISHING.md)');
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`check-posts: ${files.length} post(s), ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) process.exit(1);
