export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.relomatrix.com').replace(/\/$/, '');
export const SITE_NAME = 'Relomatrix Blog';
export const SITE_DESCRIPTION = 'Source-referenced guides on relocation, immigration, tax and cross-border compliance between Italy, the EU and the US.';
export const ORG_URL = 'https://relomatrix.com';
export const ABOUT_PATH = '/chi-siamo/';

export const ORG_ID = `${ORG_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const organizationLd = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': ORG_ID, name: 'Relomatrix', url: ORG_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/relomatrix-wordmark-navy-on-ivory.png` },
};

export const websiteLd = {
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': WEBSITE_ID, name: SITE_NAME, url: `${SITE_URL}/blog/`,
  description: SITE_DESCRIPTION, inLanguage: ['en', 'it'], publisher: { '@id': ORG_ID },
};

// BreadcrumbList from [name, path] pairs; the first item is always the blog home.
export function breadcrumbLd(items: [string, string][]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [['Blog', '/blog/'] as [string, string], ...items].map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}`,
    })),
  };
}

export const jsonLd = (ld: object | object[]) => JSON.stringify(ld).replace(/</g, '\\u003c');
