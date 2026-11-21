'use client';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { HOME, UI } from '@/lib/i18n';
import { norm, searchPosts, searchTopics, tokens, type SearchIndex, type SearchPost, type SearchTopic } from '@/lib/search';
import type { Lang } from '@/lib/posts';

const INDEX_URL = '/blog/search-index.json';
export const UI_LANG_EVENT = 'rmx-ui-lang';
const SEARCH_EVENT = 'rmx-search';
const isLang = (v: unknown): v is Lang => v === 'it' || v === 'en' || v === 'fr';
const uiLang = (): Lang => {
  if (typeof document === 'undefined') return 'en';
  const v = document.documentElement.dataset.ui || document.documentElement.lang;
  return isLang(v) ? v : 'en';
};

let indexPromise: Promise<SearchIndex> | null = null;
const loadIndex = () => (indexPromise ||= fetch(INDEX_URL).then((r) => {
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<SearchIndex>;
}).catch((e) => { indexPromise = null; throw e; }));

// Bold the words of a title that match what the reader typed.
function Highlight({ text, q }: { text: string; q: string }) {
  const toks = tokens(q);
  return <>{text.split(/(\s+)/).map((part, i) => {
    const n = norm(part);
    return n && toks.some((t) => n.startsWith(t) || (t.length >= 5 && n.startsWith(t.slice(0, -1))))
      ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>;
  })}</>;
}

type Option = { kind: 'topic'; topic: SearchTopic; href: string } | { kind: 'post'; post: SearchPost; href: string };

// Search box of the blog home: suggestions while typing (only real articles and topics, from the static
// index built with the site), full results under the hero on "Search".
export default function SearchBox() {
  const [lang, setLang] = useState<Lang>('en');
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLFormElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const t = HOME[lang];

  const ensureIndex = useCallback(() => {
    if (index) return;
    loadIndex().then(setIndex, () => setFailed(true));
  }, [index]);

  useEffect(() => {
    setLang(uiLang());
    const onLang = () => setLang(uiLang());
    window.addEventListener(UI_LANG_EVENT, onLang);
    // The header's "Search" link points to /blog/#cerca: put the cursor in the box.
    const onHash = () => { if (location.hash === '#cerca') { input.current?.focus(); ensureIndex(); } };
    onHash();
    window.addEventListener('hashchange', onHash);
    const onClick = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener(UI_LANG_EVENT, onLang);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('mousedown', onClick);
    };
  }, [ensureIndex]);

  const options: Option[] = useMemo(() => {
    if (!index || tokens(q).length === 0) return [];
    const topics = searchTopics(index, q, lang, 2).map((topic) => ({ kind: 'topic' as const, topic, href: `/blog/tag/${topic.slug}/` }));
    const posts = searchPosts(index, q, lang, 6).map((post) => ({ kind: 'post' as const, post, href: `/blog/${post.s}/` }));
    return [...topics, ...posts];
  }, [index, q, lang]);


  useEffect(() => { setActive(-1); }, [q]);

  const showList = open && tokens(q).length > 0 && !!index;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % options.length); }
    else if (e.key === 'ArrowUp' && options.length) { e.preventDefault(); setActive((a) => (a <= 0 ? options.length - 1 : a - 1)); }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1); }
    else if (e.key === 'Enter' && showList && active >= 0 && options[active]) { e.preventDefault(); location.href = options[active].href; }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokens(q).length) { input.current?.focus(); return; }
    ensureIndex();
    window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: q.trim() }));
    setOpen(false);
    requestAnimationFrame(() => document.getElementById('search-results-slot')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  useEffect(() => {
    const onClear = () => { setQ(''); input.current?.focus(); };
    window.addEventListener(`${SEARCH_EVENT}-clear`, onClear);
    return () => window.removeEventListener(`${SEARCH_EVENT}-clear`, onClear);
  }, []);

  return (
    <>
      <form ref={wrap} id="cerca" role="search" className="search" onSubmit={submit} action="/blog/tag/">
        <label htmlFor={`${id}-q`} className="search-label">{t.searchLabel}</label>
        <div className="search-row">
          <div className="search-field">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            <input
              ref={input} id={`${id}-q`} type="search" name="q" value={q} autoComplete="off" spellCheck={false}
              placeholder={t.searchPlaceholder} role="combobox" aria-autocomplete="list" aria-expanded={showList}
              aria-controls={listId} aria-activedescendant={showList && active >= 0 ? `${id}-o${active}` : undefined}
              aria-describedby={`${id}-hint`}
              onChange={(e) => { setQ(e.target.value); setOpen(true); ensureIndex(); }}
              onFocus={() => { setOpen(true); ensureIndex(); }}
              onKeyDown={onKeyDown}
            />
          </div>
          <button type="submit" className="btn-search">{t.searchButton}</button>
        </div>
        <p id={`${id}-hint`} className="search-hint">{failed ? '' : t.searchHint}</p>
        {showList && (
          <ul id={listId} role="listbox" className="suggest" aria-label={t.suggestionsTitle}>
            {options.length === 0 && <li className="suggest-empty" role="presentation">{t.noResults.replace('{q}', q.trim())}</li>}
            {options.map((o, i) => (
              <li key={o.href} id={`${id}-o${i}`} role="option" aria-selected={i === active} className={i === active ? 'active' : undefined}
                onMouseEnter={() => setActive(i)}>
                {o.kind === 'topic' ? (
                  <a href={o.href} className="suggest-topic" tabIndex={-1}>
                    <span className="suggest-tag">{HOME[o.topic.l as Lang].topicLabel}</span>
                    <span className="suggest-title"><Highlight text={o.topic.label} q={q} /></span>
                    <span className="suggest-meta">{o.topic.n === 1 ? HOME[o.topic.l as Lang].oneArticle : HOME[o.topic.l as Lang].articles.replace('{n}', String(o.topic.n))}</span>
                  </a>
                ) : (
                  <a href={o.href} tabIndex={-1} lang={o.post.l}>
                    {o.post.img ? <img src={o.post.img} alt="" width={72} height={40} loading="lazy" /> : <span className="suggest-noimg" />}
                    <span className="suggest-text">
                      <span className="suggest-title"><Highlight text={o.post.t} q={q} /></span>
                      <span className="suggest-meta">{o.post.date}{o.post.l !== lang && <span className="lang">{o.post.l.toUpperCase()}</span>}</span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </form>
    </>
  );
}

// Full results of a search, shown under the welcome band when the reader presses "Search".
export function SearchResults() {
  const [lang, setLang] = useState<Lang>('en');
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const t = HOME[lang];
  useEffect(() => {
    setLang(uiLang());
    const onLang = () => setLang(uiLang());
    const onSearch = (e: Event) => {
      setSubmitted(String((e as CustomEvent).detail || ''));
      loadIndex().then(setIndex, () => setIndex({ posts: [], topics: [] }));
      requestAnimationFrame(() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    window.addEventListener(UI_LANG_EVENT, onLang);
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => { window.removeEventListener(UI_LANG_EVENT, onLang); window.removeEventListener(SEARCH_EVENT, onSearch); };
  }, []);
  const results = useMemo(() => (index && submitted ? searchPosts(index, submitted, lang) : []), [index, submitted, lang]);
  const tryTopics = useMemo(() => (index ? index.topics.filter((x) => x.l === lang).slice(0, 6) : []), [index, lang]);
  const clear = () => { setSubmitted(null); window.dispatchEvent(new Event(`${SEARCH_EVENT}-clear`)); };
  const n = (s: string, k: number) => s.replace('{n}', String(k));
  return <div ref={box} className="search-results-anchor">{index && submitted !== null ? renderResults() : null}</div>;

  function renderResults() {
    if (submitted === null) return null;
    return (
      <section className="search-results" aria-live="polite" lang={lang}>
        <div className="search-results-head">
          <h2>{results.length ? n(results.length === 1 ? t.oneResult : t.results, results.length).replace('{q}', submitted) : t.noResults.replace('{q}', submitted)}</h2>
          <button type="button" className="btn-ghost" onClick={clear}>{t.clear}</button>
        </div>
        {results.length ? (
          <ul className="posts">
            {results.map((p) => (
              <li key={p.s} lang={p.l}>
                <a href={`/blog/${p.s}/`}>
                  {p.img && <img src={p.img} alt="" loading="lazy" decoding="async" />}
                  <div className="card-body">
                    <p className="card-meta">{p.date}<span aria-hidden="true"> · </span>{n(UI[p.l as Lang].readMin, p.m)}{p.l !== lang && <span className="lang">{p.l.toUpperCase()}</span>}</p>
                    <h3><Highlight text={p.t} q={submitted} /></h3>
                    <p className="card-desc">{p.d}</p>
                    <span className="card-more">{UI[p.l as Lang].readMore} <span aria-hidden="true">→</span></span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="try">{t.tryWith}: {tryTopics.map((x) => <a key={x.slug} className="chip" href={`/blog/tag/${x.slug}/`}>{x.label}</a>)}</p>
        )}
      </section>
    );
  }
}
