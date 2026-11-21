'use client';
import { useEffect, useState } from 'react';
import { HOME, UI } from '@/lib/i18n';
import type { Lang } from '@/lib/posts';

export const LANG_KEY = 'rmx_blog_lang';
const UI_LANG_EVENT = 'rmx-ui-lang';

// Runs before the home is painted: picks the reader's language (last choice, else the browser's) so the
// page shows one language only. Without JavaScript every language stays visible.
export const LANG_BOOT = `(function(){var l;try{l=localStorage.getItem('${LANG_KEY}')}catch(e){}if(l!=='it'&&l!=='en'&&l!=='fr'){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').slice(0,2).toLowerCase();l=n==='it'||n==='fr'?n:'en'}document.documentElement.setAttribute('data-ui',l)})();`;

export default function LangPicker({ langs, counts }: { langs: Lang[]; counts: Record<string, number> }) {
  const [cur, setCur] = useState<string | null>(null);
  useEffect(() => { setCur(document.documentElement.dataset.ui || null); }, []);
  const pick = (l: Lang) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.documentElement.setAttribute('data-ui', l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* private mode: the choice lasts for this page */ }
    setCur(l);
    window.dispatchEvent(new Event(UI_LANG_EVENT));
  };
  return (
    <div className="lang-picker">
      <span className="lang-picker-label">
        {langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{HOME[l].readIn}</span>)}
      </span>
      <div className="lang-picker-options">
        {langs.map((l) => (
          <a key={l} href={`#${l}`} hrefLang={l} lang={l} role="button" aria-pressed={cur === l} className={cur === l ? 'on' : undefined} onClick={pick(l)}>
            {UI[l].language} <span className="count">{counts[l]}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
