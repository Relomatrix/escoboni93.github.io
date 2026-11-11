import type { Metadata } from 'next';
import { Libre_Baskerville, IBM_Plex_Sans } from 'next/font/google';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, ABOUT_PATH, organizationLd, websiteLd, jsonLd } from '@/lib/site';
import CookieConsent, { CookiePrefsLink } from './CookieConsent';
import { PRIVACY_URL } from '@/lib/consent';
import { LANGS, UI } from '@/lib/i18n';
import './globals.css';

const display = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: '%s | Relomatrix' },
  description: SITE_DESCRIPTION,
  alternates: { types: { 'application/rss+xml': `${SITE_URL}/blog/rss.xml` } },
  icons: { icon: '/blog/favicon.svg' },
  // G-30: blog.relomatrix.com's deploy checks this marker on relomatrix.com/blog/ before it turns into redirects.
  other: { 'relomatrix-blog': 'embedded' },
};

// <html lang> is rewritten to "it"/"fr" for Italian and French posts after the build (scripts/set-html-lang.mjs).
// The layout is shared by every page, so its labels are written in the three languages and globals.css shows
// only the one matching <html lang> (a CSS switch, so hydration sees the same markup everywhere).
const k = (key: string) => LANGS.map((l) => [l, UI[l][key]] as const);
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organizationLd, websiteLd]) }} />
        <header className="site-header">
          <div className="wrap">
            <a href="/blog/" aria-label="Relomatrix Blog"><img src="/blog/logo.svg" alt="Relomatrix" width={220} height={40} /></a>
            <nav className="site-nav">
              {k('navTopics').map(([l, v]) => <a key={l} className={`i18n-${l}`} lang={l} href="/blog/tag/">{v}</a>)}
              {k('navAbout').map(([l, v]) => <a key={l} className={`i18n-${l}`} lang={l} href={ABOUT_PATH} hrefLang="it">{v}</a>)}
              {k('siteHome').map(([l, v]) => <a key={l} className={`cta i18n-${l}`} href={v}>relomatrix.com</a>)}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>© {new Date().getFullYear()} Relomatrix · {k('siteHome').map(([l, v]) => <a key={l} className={`i18n-${l}`} href={v}>relomatrix.com</a>)} · {k('navAbout').map(([l, v]) => <a key={l} className={`i18n-${l}`} lang={l} href={ABOUT_PATH} hrefLang="it">{v}</a>)} · <a href="/blog/rss.xml">RSS</a> · <a href={PRIVACY_URL}>Privacy</a> · <a href="/blog/cookie/">Cookie policy</a> · {k('cookiePrefs').map(([l, v]) => <span key={l} className={`i18n-${l}`} lang={l}><CookiePrefsLink label={v} /></span>)}</p>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
