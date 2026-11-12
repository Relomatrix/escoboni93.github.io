'use client';
import { useEffect, useRef, useState } from 'react';
import { evaluate, corridorFor, type Answers, type Finding } from '@/lib/impatriati';
import { ctaHref } from '@/lib/corridors';

type L = 'it' | 'en';
type Q = { key: keyof Answers; text: Record<L, string>; help?: Record<L, string>; options: [string, Record<L, string>][] };

const QUESTIONS: Q[] = [
  { key: 'origin', text: { it: 'Da quale Paese ti trasferisci in Italia?', en: 'Which country are you moving to Italy from?' },
    options: [['UK', { it: 'Regno Unito', en: 'United Kingdom' }], ['US', { it: 'Stati Uniti', en: 'United States' }],
      ['FR', { it: 'Francia', en: 'France' }], ['other', { it: 'Un altro Paese', en: 'Another country' }]] },
  { key: 'year', text: { it: 'In che anno diventi (o sei diventato) residente in Italia per le tasse?', en: 'In which year do you become (or did you become) tax resident in Italy?' },
    options: [['before2024', { it: 'Prima del 2024', en: 'Before 2024' }], ['2024to2026', { it: 'Nel 2024, 2025 o 2026', en: 'In 2024, 2025 or 2026' }],
      ['2027plus', { it: 'Nel 2027 o dopo', en: 'In 2027 or later' }]] },
  { key: 'employer', text: { it: 'In Italia lavorerai per la stessa azienda (o lo stesso gruppo) per cui lavori all’estero?', en: 'In Italy, will you work for the same employer (or group) you work for abroad?' },
    help: { it: 'Per esempio se la tua azienda ti manda in Italia, o se resti nella stessa multinazionale.', en: 'For example if your employer sends you to Italy, or you stay with the same multinational.' },
    options: [['different', { it: 'No, un datore di lavoro diverso, oppure lavoro in proprio', en: 'No, a different employer, or I am self-employed' }],
      ['sameNeverItaly', { it: 'Sì, e prima di partire non avevo mai lavorato in Italia per loro', en: 'Yes, and I had never worked for them in Italy before leaving' }],
      ['sameWorkedItaly', { it: 'Sì, e prima di partire lavoravo già in Italia per loro', en: 'Yes, and I already worked for them in Italy before leaving' }]] },
  { key: 'yearsAbroad', text: { it: 'Prima del trasferimento, per quanti anni interi sei stato residente all’estero per le tasse?', en: 'Before the move, for how many full years were you tax resident abroad?' },
    help: { it: 'Per un cittadino italiano conta l’iscrizione all’AIRE, oppure la residenza in un altro Paese secondo la convenzione contro le doppie imposizioni.', en: 'For an Italian citizen, registration with AIRE counts, or residence in another country under the double tax treaty.' },
    options: [['lt3', { it: 'Meno di 3 anni', en: 'Less than 3 years' }], ['3to5', { it: 'Da 3 a 5 anni', en: '3 to 5 years' }], ['6', { it: '6 anni', en: '6 years' }],
      ['7plus', { it: '7 anni o più', en: '7 years or more' }], ['unknown', { it: 'Non lo so', en: 'I am not sure' }]] },
  { key: 'income', text: { it: 'Che tipo di lavoro farai in Italia?', en: 'What kind of work will you do in Italy?' },
    options: [['employee', { it: 'Lavoro dipendente (busta paga)', en: 'Employee (on payroll)' }],
      ['professional', { it: 'Libero professionista (per esempio consulente, avvocato, medico, designer)', en: 'Freelance professional (for example consultant, lawyer, doctor, designer)' }],
      ['business', { it: 'Ho un’impresa o una ditta individuale', en: 'I run a business or a sole-trader company' }],
      ['other', { it: 'Non lavorerò: vivrò di pensione, affitti o investimenti', en: 'I will not work: I will live on a pension, rents or investments' }]] },
  { key: 'mostlyItaly', text: { it: 'Lavorerai fisicamente in Italia per la maggior parte dell’anno?', en: 'Will you physically work in Italy for most of the year?' },
    options: [['yes', { it: 'Sì', en: 'Yes' }], ['no', { it: 'No, lavorerò soprattutto da altri Paesi', en: 'No, I will mostly work from other countries' }], ['unknown', { it: 'Non lo so ancora', en: 'I do not know yet' }]] },
  { key: 'qualified', text: { it: 'Hai una laurea o una qualifica professionale di livello elevato?', en: 'Do you have a university degree or a high-level professional qualification?' },
    help: { it: 'La legge rimanda ai requisiti dei decreti legislativi 108/2012 e 206/2007. Di solito basta un titolo universitario di almeno tre anni, ma va verificato sul tuo caso.', en: 'The law refers to the requirements of Legislative Decrees 108/2012 and 206/2007. A university degree of at least three years usually qualifies, but your case must be checked.' },
    options: [['yes', { it: 'Sì', en: 'Yes' }], ['no', { it: 'No', en: 'No' }], ['unknown', { it: 'Non sono sicuro', en: 'I am not sure' }]] },
  { key: 'over600k', text: { it: 'Il tuo reddito da lavoro in Italia supererà 600.000 euro l’anno?', en: 'Will your work income in Italy exceed 600,000 euros a year?' },
    options: [['no', { it: 'No', en: 'No' }], ['yes', { it: 'Sì', en: 'Yes' }]] },
  { key: 'stay4', text: { it: 'Pensi di restare residente in Italia almeno 4 anni?', en: 'Do you plan to stay resident in Italy for at least 4 years?' },
    options: [['yes', { it: 'Sì', en: 'Yes' }], ['unsure', { it: 'Non sono sicuro', en: 'I am not sure' }], ['no', { it: 'No', en: 'No' }]] },
  { key: 'children', text: { it: 'Ti trasferisci con un figlio minorenne, o ne aspetti uno?', en: 'Are you moving with a child under 18, or expecting one?' },
    help: { it: 'Il figlio deve essere residente in Italia. Vale anche un figlio nato o adottato durante il regime.', en: 'The child must be resident in Italy. A child born or adopted during the regime also counts.' },
    options: [['yes', { it: 'Sì', en: 'Yes' }], ['no', { it: 'No', en: 'No' }]] },
];

const FINDINGS: Record<Finding, Record<L, string>> = {
  oldRegime: { it: 'Ti sei trasferito prima del 2024: per te valgono le regole del vecchio regime, che questo test non controlla.', en: 'You moved before 2024: the old regime rules apply to you, and this check does not cover them.' },
  yearsShort: { it: 'Gli anni all’estero non bastano. Nel tuo caso ne servono almeno {n}.', en: 'You have not spent enough years abroad. In your case at least {n} are needed.' },
  yearsUnknown: { it: 'Va verificato quanti anni sei stato residente all’estero per le tasse. Nel tuo caso ne servono almeno {n}.', en: 'Your years of tax residence abroad need checking. In your case at least {n} are needed.' },
  incomeNotCovered: { it: 'Il regime vale solo per il lavoro dipendente e per i liberi professionisti, non per i redditi d’impresa, le pensioni o le rendite.', en: 'The regime only covers employees and freelance professionals, not business income, pensions or investment income.' },
  notMostlyItaly: { it: 'Il lavoro deve essere svolto in Italia per la maggior parte dell’anno.', en: 'The work must be done in Italy for most of the year.' },
  mostlyItalyUnknown: { it: 'Il lavoro deve essere svolto in Italia per la maggior parte dell’anno: va verificato.', en: 'The work must be done in Italy for most of the year: this needs checking.' },
  notQualified: { it: 'Serve un’elevata qualificazione o specializzazione.', en: 'A high qualification or specialisation is required.' },
  qualifiedUnknown: { it: 'Va verificato se il tuo titolo di studio o la tua qualifica bastano.', en: 'Whether your degree or qualification is enough needs checking.' },
  cap600k: { it: 'L’agevolazione vale entro il limite di 600.000 euro l’anno: come si applica sopra questa cifra va verificato.', en: 'The relief applies within a limit of 600,000 euros a year: how it works above that amount needs checking.' },
  leaveEarly: { it: 'Chi non resta residente in Italia per almeno 4 anni perde il beneficio e deve restituirlo con gli interessi.', en: 'If you do not stay resident in Italy for at least 4 years, you lose the relief and must pay it back with interest.' },
  stayUnsure: { it: 'Attenzione: se lasci l’Italia prima di 4 anni, il beneficio va restituito con gli interessi.', en: 'Careful: if you leave Italy before 4 years, the relief must be paid back with interest.' },
  from2027: { it: 'Dal 2027 c’è il nuovo Testo unico delle imposte sui redditi, e chi arriva dal 2027 non può più sommare questo regime con quello dei neo residenti. Le regole vanno ricontrollate al momento del trasferimento.', en: 'From 2027 a new Italian income tax code applies, and people arriving from 2027 can no longer combine this regime with the new-resident flat tax. The rules must be rechecked when you move.' },
};

const T = {
  it: { step: 'Domanda {i} di {n}', back: 'Indietro', restart: 'Ricomincia',
    likely: 'Sembra che tu abbia diritto al regime impatriati', check: 'Potresti avere diritto, ma alcune cose vanno verificate', unlikely: 'Probabilmente non hai diritto al regime impatriati',
    share: 'Se hai diritto, paghi le tasse solo sul {p}% del reddito da lavoro prodotto in Italia, per l’anno del trasferimento e i 4 anni successivi.',
    why: 'Perché', verify: 'Da verificare', good: 'Tutti i requisiti che ci hai indicato risultano rispettati.', note: 'Da sapere',
    ctaTitle: 'Vuoi una risposta sicura sul tuo caso?', ctaText: 'Il Risk Report controlla il tuo trasferimento su fonti ufficiali, e una persona lo rivede prima di mandartelo.', cta: 'Scopri il Risk Report',
    privacy: 'Le risposte restano nel tuo browser: non le salviamo e non usiamo l’intelligenza artificiale.',
    disclaimer: 'Informazioni di carattere generale, non consulenza fiscale.' },
  en: { step: 'Question {i} of {n}', back: 'Back', restart: 'Start again',
    likely: 'You appear to qualify for the impatriate regime', check: 'You may qualify, but some points need checking', unlikely: 'You probably do not qualify for the impatriate regime',
    share: 'If you qualify, you pay tax on only {p}% of your work income earned in Italy, for the year of the move and the following 4 years.',
    why: 'Why', verify: 'To check', good: 'Every requirement you told us about appears to be met.', note: 'Good to know',
    ctaTitle: 'Want a reliable answer on your case?', ctaText: 'The Risk Report checks your move against official sources, and a person reviews it before it is sent to you.', cta: 'See the Risk Report',
    privacy: 'Your answers stay in your browser: we do not store them and we do not use artificial intelligence.',
    disclaimer: 'General information, not tax advice.' },
};

export default function ImpatriatiCheck({ lang }: { lang: L }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const t = T[lang];
  const done = step >= QUESTIONS.length;
  const box = useRef<HTMLElement>(null);
  const touched = useRef(false);
  // On a phone the next question (or the result) can start below the fold: bring it into view after each answer.
  useEffect(() => { if (touched.current) box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [step]);

  const choose = (key: keyof Answers, value: string) => {
    touched.current = true;
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };
  const restart = () => { setAnswers({}); setStep(0); };

  if (!done) {
    const q = QUESTIONS[step];
    return (
      <section ref={box} className="check" aria-live="polite">
        <p className="check-step">{t.step.replace('{i}', String(step + 1)).replace('{n}', String(QUESTIONS.length))}</p>
        <h2>{q.text[lang]}</h2>
        {q.help ? <p className="check-help">{q.help[lang]}</p> : null}
        <div className="check-options">
          {q.options.map(([value, label]) => (
            <button key={value} type="button" className={answers[q.key] === value ? 'chosen' : ''} onClick={() => choose(q.key, value)}>{label[lang]}</button>
          ))}
        </div>
        {step > 0 ? <button type="button" className="check-link" onClick={() => setStep(step - 1)}>← {t.back}</button> : null}
        <p className="check-help">{t.privacy}</p>
      </section>
    );
  }

  const r = evaluate(answers);
  const say = (f: Finding) => FINDINGS[f][lang].replace('{n}', String(r.requiredYears));
  const corridor = corridorFor(answers.origin);
  return (
    <section ref={box} className={`check result-${r.status}`} aria-live="polite">
      <h2>{t[r.status]}</h2>
      {r.status !== 'unlikely' ? <p className="lead">{t.share.replace('{p}', String(r.taxableShare))}</p> : null}
      {r.blockers.length ? <><h3>{t.why}</h3><ul>{r.blockers.map((f) => <li key={f}>{say(f)}</li>)}</ul></> : null}
      {r.doubts.length ? <><h3>{t.verify}</h3><ul>{r.doubts.map((f) => <li key={f}>{say(f)}</li>)}</ul></> : null}
      {r.status === 'likely' ? <p>{t.good}</p> : null}
      {r.notes.length ? <><h3>{t.note}</h3><ul>{r.notes.map((f) => <li key={f}>{say(f)}</li>)}</ul></> : null}
      <div className="cta-box">
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaText}</p>
        <p><a href={ctaHref(lang, 'test-regime-impatriati', corridor)} data-cta="blog-impatriati-check" data-corridor={corridor || ''}>{t.cta} →</a></p>
      </div>
      <p><button type="button" className="check-link" onClick={restart}>↺ {t.restart}</button></p>
      <p className="check-help">{t.disclaimer}</p>
    </section>
  );
}
