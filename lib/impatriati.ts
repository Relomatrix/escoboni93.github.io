// Deterministic eligibility check for the Italian "regime impatriati" (art. 5 D.Lgs. 209/2023), as described
// by the Agenzia delle Entrate. No AI, no network, nothing stored: answers stay in the reader's browser.
// Keep in sync with content/posts/regime-impatriati-2026-requisiti-tassazione-50.md (same official sources).

export type Answers = {
  origin?: 'UK' | 'US' | 'FR' | 'other';
  year?: 'before2024' | '2024to2026' | '2027plus';
  employer?: 'different' | 'sameNeverItaly' | 'sameWorkedItaly';
  yearsAbroad?: 'lt3' | '3to5' | '6' | '7plus' | 'unknown';
  income?: 'employee' | 'professional' | 'business' | 'other';
  mostlyItaly?: 'yes' | 'no' | 'unknown';
  qualified?: 'yes' | 'no' | 'unknown';
  over600k?: 'no' | 'yes';
  stay4?: 'yes' | 'unsure' | 'no';
  children?: 'yes' | 'no';
};

export type Finding =
  | 'oldRegime' | 'yearsShort' | 'yearsUnknown' | 'incomeNotCovered' | 'notMostlyItaly' | 'mostlyItalyUnknown'
  | 'notQualified' | 'qualifiedUnknown' | 'cap600k' | 'leaveEarly' | 'stayUnsure' | 'from2027';

export type Result = {
  status: 'likely' | 'check' | 'unlikely';
  blockers: Finding[];
  doubts: Finding[];
  notes: Finding[];
  requiredYears: 3 | 6 | 7;
  taxableShare: 50 | 40;
};

const REQUIRED: Record<NonNullable<Answers['employer']>, 3 | 6 | 7> = { different: 3, sameNeverItaly: 6, sameWorkedItaly: 7 };
const MIN_YEARS: Record<Exclude<NonNullable<Answers['yearsAbroad']>, 'unknown'>, number> = { lt3: 0, '3to5': 3, '6': 6, '7plus': 7 };

export function evaluate(a: Answers): Result {
  const blockers: Finding[] = [];
  const doubts: Finding[] = [];
  const notes: Finding[] = [];
  const requiredYears = REQUIRED[a.employer || 'different'];

  if (a.year === 'before2024') doubts.push('oldRegime');
  if (a.year === '2027plus') notes.push('from2027');

  if (a.yearsAbroad === 'unknown') doubts.push('yearsUnknown');
  else if (a.yearsAbroad && MIN_YEARS[a.yearsAbroad] < requiredYears) blockers.push('yearsShort');

  if (a.income === 'business' || a.income === 'other') blockers.push('incomeNotCovered');
  if (a.mostlyItaly === 'no') blockers.push('notMostlyItaly');
  if (a.mostlyItaly === 'unknown') doubts.push('mostlyItalyUnknown');
  if (a.qualified === 'no') blockers.push('notQualified');
  if (a.qualified === 'unknown') doubts.push('qualifiedUnknown');
  if (a.over600k === 'yes') doubts.push('cap600k');
  if (a.stay4 === 'no') blockers.push('leaveEarly');
  if (a.stay4 === 'unsure') doubts.push('stayUnsure');

  const status = blockers.length ? 'unlikely' : doubts.length ? 'check' : 'likely';
  return { status, blockers, doubts, notes, requiredYears, taxableShare: a.children === 'yes' ? 40 : 50 };
}

/** Corridor for the Risk Report CTA; only corridors sold to private clients. */
export const corridorFor = (origin?: Answers['origin']) =>
  origin === 'UK' ? 'UK-IT' : origin === 'US' ? 'US-IT' : origin === 'FR' ? 'FR-IT' : undefined;
