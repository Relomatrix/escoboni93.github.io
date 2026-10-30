import type { Metadata } from 'next';
import { Libre_Baskerville, IBM_Plex_Sans } from 'next/font/google';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import CookieConsent, { CookiePrefsLink } from './CookieConsent';
import { PRIVACY_URL } from '@/lib/consent';
import './globals.css';

const display = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: '%s | Relomatrix' },
  description: SITE_DESCRIPTION,
  alternates: { types: { 'application/rss+xml': `${SITE_URL}/rss.xml` } },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <a href="/blog" aria-label="Relomatrix Blog"><img src="/logo.svg" alt="Relomatrix" width={220} height={40} /></a>
            <a className="cta" href="https://relomatrix.com">relomatrix.com</a>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>© {new Date().getFullYear()} Relomatrix · <a href="https://relomatrix.com">relomatrix.com</a> · <a href="/rss.xml">RSS</a> · <a href={PRIVACY_URL}>Privacy</a> · <a href="/cookie">Cookie policy</a> · <CookiePrefsLink label="Preferenze cookie" /></p>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
