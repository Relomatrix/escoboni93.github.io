import { getAllPosts, getAllTags } from '@/lib/posts';
import { ABOUT_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { IMPATRIATI_TOOL } from '@/lib/tools';
export const dynamic = 'force-static';

// https://llmstxt.org: a plain Markdown map of the site for AI assistants.
export function GET() {
  const posts = getAllPosts();
  const line = (title: string, url: string, note?: string) => `- [${title}](${url})${note ? `: ${note}` : ''}`;
  const body = [
    `# ${SITE_NAME}`, '',
    `> ${SITE_DESCRIPTION} Every legal, tax or immigration claim links to an official source; general information, not legal advice.`, '',
    `Published by Relomatrix (https://www.relomatrix.com). Articles are in English, Italian or French (lang shown per article). Editorial policy: ${SITE_URL}${ABOUT_PATH}`, '',
    '## Articles',
    ...posts.map((p) => line(p.title, `${SITE_URL}/blog/${p.slug}/`, `${p.description} (${p.lang}, updated ${p.updated || p.date})`)), '',
    '## Free tools',
    line('Italy impatriate regime check (EN)', `${SITE_URL}${IMPATRIATI_TOOL.en}`, '10 questions, deterministic rules from the Agenzia delle Entrate, no AI, nothing stored'),
    line('Test regime impatriati (IT)', `${SITE_URL}${IMPATRIATI_TOOL.it}`), '',
    '## Topics',
    ...getAllTags().map((t) => line(t.label, `${SITE_URL}/blog/tag/${t.slug}/`)), '',
    '## Optional',
    line('About and editorial policy', `${SITE_URL}${ABOUT_PATH}`),
    line('Sitemap', `${SITE_URL}/blog/sitemap.xml`),
    line('RSS', `${SITE_URL}/blog/rss.xml`), '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
