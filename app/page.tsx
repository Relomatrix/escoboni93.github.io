import type { Metadata } from 'next';
// Static export cannot issue HTTP redirects: meta refresh + canonical to /blog/.
export const metadata: Metadata = {
  alternates: { canonical: '/blog/' },
  robots: { index: false, follow: true },
};
export default function Home() {
  return <><meta httpEquiv="refresh" content="0; url=/blog/" /><p><a href="/blog/">Relomatrix Blog</a></p></>;
}
